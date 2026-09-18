import "server-only";

/**
 * The landing page's live tape.
 *
 * The platform's backend exposes exactly one market-data surface that does not
 * require a signed-in user: `GET /live/tape/stream`, a server-sent-event feed
 * carrying the indices, VIX, WTI, gold, the dollar, bitcoin, the 10-year and a
 * dozen mega-caps. Everything else (movers, earnings, analyst actions, insider
 * filings, portfolios) is behind a Firebase ID token, which a marketing page
 * has no business holding.
 *
 * Two things make this safe to put on a page that must stay fast:
 *
 *  1. It is read HERE, on the server, not in the visitor's browser. The
 *     backend's CORS allowlist does not include this site's origin, and
 *     Firebase Hosting buffers SSE so the stream never flushes through it —
 *     a browser fetch would hang and then fail. Server-to-server has neither
 *     problem.
 *  2. Nothing waits for it. The page ships its static figures, hydrates, and
 *     only then asks for the live ones. If this file returns null the visitor
 *     sees the designed numbers and never knows a request happened.
 *
 * We take the FIRST frame and hang up. The stream would happily push updates
 * for as long as we hold it open, but an HTTP route that never returns is not
 * a route; the refresh cadence belongs to the client, against the cache below.
 */

/** The public Cloud Run service. Overridable for staging or a local backend. */
const ORIGIN =
  process.env.MARKET_TAPE_ORIGIN?.replace(/\/+$/, "") ??
  "https://market-catalyst-live-741318166823.us-central1.run.app";

/** How long one upstream read is reused. The feed is ~15 minutes delayed, so
 *  anything under a minute is already finer than the data underneath it. */
const TTL_MS = 20_000;

/** Hard ceiling on the upstream read. A landing page that waits is worse than
 *  a landing page with last week's numbers on it. */
const TIMEOUT_MS = 4_000;

/** One item of the upstream frame (backend: src/live/tape.service.ts). */
type TapeItem = {
  id: string;
  kind: "index" | "stock" | "rate";
  label: string;
  unit?: "percent";
  value: number | null;
  pctChange: number | null;
  prevClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
};

type TapeFrame = {
  items: TapeItem[];
  asOf: string;
  vendorDelayNote: string;
  marketPhase: "open" | "pre" | "after" | "closed" | "unknown";
  stale: boolean;
};

/* ── Reading one frame ──────────────────────────────────────────────────── */

/**
 * Open the stream, keep only the first `tape` event, abort.
 *
 * SSE frames are blank-line delimited; we parse incrementally rather than
 * buffering the whole (endless) body, and abort the moment we have what we
 * came for so the connection is not left open on the backend.
 */
async function readFirstFrame(): Promise<TapeFrame | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${ORIGIN}/live/tape/stream`, {
      signal: ctrl.signal,
      headers: { accept: "text/event-stream" },
      cache: "no-store",
    });
    if (!res.ok || !res.body) return null;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    // Bounded so a misbehaving upstream cannot stream us out of memory.
    while (buf.length < 512_000) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });

      let split: number;
      while ((split = buf.indexOf("\n\n")) !== -1) {
        const block = buf.slice(0, split);
        buf = buf.slice(split + 2);
        // Heartbeats share the stream; only the tape event carries prices.
        if (!/^event:\s*tape\s*$/m.test(block)) continue;
        const data = block
          .split(/\r?\n/)
          .filter((l) => l.startsWith("data:"))
          .map((l) => l.slice(5).trim())
          .join("");
        if (!data) continue;
        void reader.cancel().catch(() => {});
        return JSON.parse(data) as TapeFrame;
      }
    }
    void reader.cancel().catch(() => {});
    return null;
  } catch {
    // Upstream down, slow, or aborted — the caller falls back to static copy.
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

const pct = (p: number) => `${p >= 0 ? "+" : MINUS}${Math.abs(p).toFixed(2)}%`;

/** A move of ±3% or more fills the bar; below that it scales linearly. */
const bar = (p: number) => `${Math.round(Math.min(100, 26 + (Math.abs(p) / 3) * 74))}%`;

/* ── Mapping ────────────────────────────────────────────────────────────── */

/** Upstream id → the HUD key the static data already uses, in HUD order. */
const CELLS: { id: string; k: string; dp: number }[] = [
  { id: "SPX", k: "S&P 500", dp: 2 },
  { id: "GOLD", k: "GOLD", dp: 2 },
  { id: "VIX", k: "VIX", dp: 2 },
  { id: "WTI", k: "WTI CRUDE", dp: 2 },
];

/**
 * The note under each figure.
 *
 * The designed copy is editorial ("haven bid, real yields easing") and that is
 * fine beside designed numbers — but beside a LIVE number it can contradict
 * the very figure it sits under. So once real data arrives the note becomes
 * something the frame can vouch for: the prior close, or the session range.
 */
function noteFor(it: TapeItem, dp: number): string {
  if (it.prevClose != null) return `prev close ${num(it.prevClose, dp)}`;
  if (it.dayLow != null && it.dayHigh != null) {
    return `day ${num(it.dayLow, dp)}${MINUS}${num(it.dayHigh, dp)}`;
  }
  return "live from the tape";
}

/**
 * The line under the HUD, assembled from the four figures rather than written.
 *
 * It says only what the numbers say — which direction the index went, whether
 * volatility went with it or against it, and whether gold is being bid. No
 * forecast, no adjective the data cannot support.
 */
function readFor(by: Map<string, TapeItem>): string {
  const p = (id: string) => by.get(id)?.pctChange ?? null;
  const spx = p("SPX");
  const vix = p("VIX");
  const gold = p("GOLD");
  const wti = p("WTI");

  if (spx == null) return "Live tape: figures above are the current session, vendor-delayed.";

  const dir = spx >= 0 ? "Risk-on tape" : "Risk-off tape";
  const bits: string[] = [];
  if (vix != null) {
    bits.push(
      vix >= 0
        ? `volatility bid ${pct(vix).replace(MINUS, "")} even as the index ${spx >= 0 ? "rose" : "fell"}`
        : `volatility easing ${Math.abs(vix).toFixed(2)}%`,
    );
  }
  if (gold != null) bits.push(gold >= 0 ? "gold catching a haven bid" : "gold offered");
  if (wti != null) bits.push(wti >= 0 ? "crude firm" : "crude leading the downside");

  return `${dir}: S&P ${pct(spx)}, ${bits.join(", ")}.`;
}

function toSnapshot(f: TapeFrame): LiveTape {
  const by = new Map(f.items.map((i) => [i.id, i]));

  const cells: LiveCell[] = [];
  for (const c of CELLS) {
    const it = by.get(c.id);
    if (!it || it.value == null || it.pctChange == null) continue;
    cells.push({
      k: c.k,
      v: num(it.value, c.dp),
      chg: pct(it.pctChange),
      arrow: it.pctChange >= 0 ? "▲" : "▼",
      tone: it.pctChange >= 0 ? "up" : "down",
      w: bar(it.pctChange),
      note: noteFor(it, c.dp),
    });
  }

  const quotes: LiveQuote[] = f.items
    .filter((i) => i.kind === "stock" && i.pctChange != null)
    .map((i) => ({
      sym: i.label,
      chg: pct(i.pctChange as number),
      tone: ((i.pctChange as number) >= 0 ? "up" : "down") as "up" | "down",
    }));

  return {
    asOf: f.asOf,
    phase: f.marketPhase,
    stale: f.stale,
    delayNote: f.vendorDelayNote,
    cells,
    quotes,
    read: readFor(by),
  };
}

/* ── Public entry point ─────────────────────────────────────────────────── */

/**
 * The current tape, or null if the backend did not answer in time.
 *
 * Never throws: every caller is a page that must render without it.
 */
export async function getLiveTape(): Promise<LiveTape | null> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.snap;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const frame = await readFirstFrame();
    if (!frame) {
      // Serve a stale snapshot rather than nothing — last session's real
      // numbers beat falling back to the mock while the backend restarts.
      return cached?.snap ?? null;
    }
    const snap = toSnapshot(frame);
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
