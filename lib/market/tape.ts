import "server-only";

/**
 * The landing page's live tape.
 *
 * Read from the backend's one anonymous market endpoint,
 * `GET /public/landing-tape` (backend: src/live/landing-tape.service.ts). It
 * carries only what this page renders — the four hero figures and the
 * marquee's symbol + move — and nothing else the platform serves. Everything
 * else (movers, earnings, portfolios, ...) is behind a Firebase ID token, which
 * a marketing page has no business holding.
 *
 * It is read HERE, on the server, never from the visitor's browser:
 *  - the backend origin stays out of the client bundle, and its CORS allowlist
 *    does not need to include this site;
 *  - the page route and /api/market/tape both answer from the cache below, so
 *    a traffic spike costs the backend one request per window, not one per
 *    visitor.
 *
 * Never throws. A null return means "no figures" and the page renders
 * placeholders — never invented numbers.
 */

/** The backend service. Overridable for staging or a local backend. */
const ORIGIN =
  process.env.MARKET_TAPE_ORIGIN?.replace(/\/+$/, "") ??
  "https://market-catalyst-live-741318166823.us-central1.run.app";

/** How long one upstream read is reused. The feed is ~15 minutes delayed, so
 *  anything under a minute is already finer than the data underneath it. */
const TTL_MS = 30_000;

/** Hard ceiling on the upstream read. A landing page that waits is worse than
 *  one showing placeholders for a moment. */
const TIMEOUT_MS = 4_000;

/** The backend payload (mirrors LandingTape in landing-tape.service.ts). */
type Upstream = {
  asOf: string;
  phase: "open" | "pre" | "after" | "closed" | "unknown";
  stale: boolean;
  delayMinutes: number;
  cells: {
    id: "SPX" | "GOLD" | "VIX" | "BRENT";
    value: number;
    pctChange: number;
    prevClose: number | null;
    basis: "live" | "close" | "saved";
    date: string | null;
  }[];
  quotes: { sym: string; pctChange: number }[];
};

async function readUpstream(): Promise<Upstream | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${ORIGIN}/public/landing-tape`, {
      signal: ctrl.signal,
      headers: { accept: "application/json" },
      // Not Next's data cache: on App Hosting a cached entry is refreshed in
      // the background after the response, which Cloud Run's CPU throttling
      // never lets finish — the first (build-time) answer would be served
      // forever. The in-memory cache below does the job instead.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as Upstream;
    return Array.isArray(body?.cells) ? body : null;
  } catch {
    // Upstream down, slow, or aborted — the caller keeps what it has.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ── Cache ──────────────────────────────────────────────────────────────── */

let cached: { at: number; snap: LiveTape } | null = null;
/** Concurrent requests share one upstream read rather than starting a stampede. */
let inFlight: Promise<LiveTape | null> | null = null;

/* ── The shape the landing page consumes ─────────────────────── */

// Declared in their own module, free of `server-only`, so the client
// components that render this data can import the types without dragging the
// reader (and its fetch) into the browser bundle.
export type { LiveCell, LiveQuote, LiveTape } from "./tape-types";
import type { LiveCell, LiveQuote, LiveTape } from "./tape-types";

/* ── Formatting ─────────────────────────────────────────────────────────── */

// U+2212 MINUS, not a hyphen: it is what the rest of the page uses and it
// aligns in the monospace column, which a hyphen does not.
const MINUS = "−";

const num = (n: number, dp: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

const pct = (p: number) => `${p > 0 ? "+" : p < 0 ? MINUS : ""}${Math.abs(p).toFixed(2)}%`;

/** A move of ±3% or more fills the bar; below that it scales linearly. */
const bar = (p: number) => `${Math.round(Math.min(100, 26 + (Math.abs(p) / 3) * 74))}%`;

/** "2026-09-18" -> "Sep 18". Parsed as a calendar date, not an instant. */
const shortDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

/* ── Mapping ────────────────────────────────────────────────────────────── */

/** Upstream id -> the HUD key and label, in HUD order. */
const CELLS: { id: Upstream["cells"][number]["id"]; k: string; dp: number }[] = [
  { id: "SPX", k: "S&P 500", dp: 2 },
  { id: "GOLD", k: "GOLD", dp: 2 },
  { id: "VIX", k: "VIX", dp: 2 },
  { id: "BRENT", k: "BRENT CRUDE", dp: 2 },
];

/**
 * The note under each figure: only what the payload can vouch for. A live
 * figure shows the close it is measured from; a completed-session figure says
 * which session it is, so a weekend reading is never mistaken for live.
 */
function noteFor(c: Upstream["cells"][number], dp: number): string {
  // Every source is failing and this is the last value the backend recorded.
  if (c.basis === "saved" && c.date) return `last recorded ${shortDate(c.date)}`;
  if (c.basis === "close" && c.date) {
    return c.prevClose != null
      ? `${shortDate(c.date)} close · prev ${num(c.prevClose, dp)}`
      : `${shortDate(c.date)} close`;
  }
  return c.prevClose != null ? `prev close ${num(c.prevClose, dp)}` : "current session";
}

/**
 * The line under the HUD, assembled from the four figures rather than written.
 * It says only what the numbers say: the index's direction, whether volatility
 * moved with or against it, and which way gold and crude went.
 */
function readFor(by: Map<string, Upstream["cells"][number]>): string {
  const p = (id: string) => by.get(id)?.pctChange ?? null;
  const spx = p("SPX");
  const vix = p("VIX");
  const gold = p("GOLD");
  const brent = p("BRENT");

  if (spx == null) return "Market figures above are the latest available, vendor-delayed.";

  const flat = (x: number) => Math.abs(x) < 0.005;
  const lead = flat(spx) ? "Flat tape" : spx > 0 ? "Risk-on tape" : "Risk-off tape";
  const bits: string[] = [];
  if (vix != null && !flat(vix)) {
    const withIndex = (vix > 0) === (spx > 0) && !flat(spx);
    bits.push(`volatility ${vix > 0 ? "up" : "down"} ${Math.abs(vix).toFixed(2)}%${withIndex ? " alongside it" : ""}`);
  }
  if (gold != null && !flat(gold)) bits.push(gold > 0 ? "gold bid" : "gold offered");
  if (brent != null && !flat(brent)) bits.push(brent > 0 ? "crude firmer" : "crude lower");

  return `${lead}: S&P ${pct(spx)}${bits.length ? `, ${bits.join(", ")}` : ""}.`;
}

function phaseDelayNote(u: Upstream): string {
  return `Stock prices are up to ~${u.delayMinutes} minutes delayed. S&P 500 and VIX are the indices; gold and Brent are front-month futures.`;
}

function toSnapshot(u: Upstream): LiveTape {
  const by = new Map(u.cells.map((c) => [c.id, c]));

  const cells: LiveCell[] = [];
  for (const def of CELLS) {
    const c = by.get(def.id);
    if (!c) continue;
    cells.push({
      k: def.k,
      v: num(c.value, def.dp),
      chg: pct(c.pctChange),
      arrow: c.pctChange >= 0 ? "▲" : "▼",
      tone: c.pctChange >= 0 ? "up" : "down",
      w: bar(c.pctChange),
      note: noteFor(c, def.dp),
    });
  }

  const quotes: LiveQuote[] = u.quotes.map((q) => ({
    sym: q.sym,
    chg: pct(q.pctChange),
    tone: q.pctChange >= 0 ? "up" : "down",
  }));

  return {
    asOf: u.asOf,
    phase: u.phase,
    stale: u.stale,
    delayNote: phaseDelayNote(u),
    cells,
    quotes,
    read: readFor(by),
  };
}

/* ── Public entry point ─────────────────────────────────────────────────── */

/**
 * The current tape, or null if the backend has never answered.
 *
 * Never throws: every caller is a page that must render without it.
 */
export async function getLiveTape(): Promise<LiveTape | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.snap;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const u = await readUpstream();
    if (!u || u.cells.length === 0) {
      // Serve the last good snapshot rather than nothing — real numbers from
      // a minute ago beat placeholders while the backend restarts.
      return cached?.snap ?? null;
    }
    const snap = toSnapshot(u);
    cached = { at: Date.now(), snap };
    return snap;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

/** Seconds a CDN may serve this without asking again. */
export const TAPE_MAX_AGE = Math.floor(TTL_MS / 1000);
