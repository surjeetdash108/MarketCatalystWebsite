// ============================================================
// LANDING PAGE CONTENT
// ============================================================
// Every string, figure and colour *tone* the landing page renders.
// Colours are never hex here: a tone is a token name resolved by
// `tone()` into a var() from app/theme.css, so the palette stays
// in one file.

export type Tone = "up" | "down" | "amber" | "text" | "muted" | "faint" | "idle" | "line";

const TONE_VAR: Record<Tone, string> = {
  up: "--mc-up",
  down: "--mc-down",
  amber: "--mc-amber",
  text: "--mc-text",
  muted: "--mc-text-muted",
  faint: "--mc-text-faint",
  idle: "--mc-spark-idle",
  line: "--mc-line-strong",
};

/** Resolve a tone to the CSS custom property that carries its colour. */
export const tone = (t: Tone) => `var(${TONE_VAR[t]})`;

// ── Hero HUD ────────────────────────────────────────────────
export type Hud = {
  k: string;
  v: string;
  chg: string;
  arrow: string;
  tone: Tone;
  /** 0 = static (as drawn), 1 = HomeMotion drifts the figure while idle. */
  drift: 0 | 1;
  w: string;
  note: string;
};

/**
 * The HUD before any real figure exists — only reached if the backend has never
 * answered (the page is normally server-rendered with the live tape). Neutral
 * dashes, never invented numbers: a made-up S&P level on a market-data site
 * reads as a wrong one.
 */
export const hud: Hud[] = ["S&P 500", "GOLD", "VIX", "BRENT CRUDE"].map((k) => ({
  k,
  v: "—",
  chg: "",
  arrow: "",
  tone: "faint" as Tone,
  drift: 0 as const,
  w: "0%",
  note: "awaiting the tape",
}));

export const hudRead = "Loading the latest market figures…";

// ── Marquee tape ────────────────────────────────────────────
export type TapeItem = { sym: string; chg: string; tone: Tone };

/** Placeholder symbols, shown with no move until the live quotes arrive. */
const tapeBase: TapeItem[] = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AVGO", "JPM", "V", "XOM", "LLY"].map(
  (sym) => ({ sym, chg: "—", tone: "faint" as Tone }),
);

/** Doubled so the marquee can wrap seamlessly at half its scroll width. */
export const tape: TapeItem[] = [...tapeBase, ...tapeBase];

// ── Coverage stats ──────────────────────────────────────────
export type Stat = { value: number; suffix: string; label: string; note: string };

export const stats: Stat[] = [
  {
    value: 14,
    suffix: "workspaces",
    label: "Every view in one scroll",
    note: "Movers, earnings, heatmap, macro, screener, themes, IPOs, recaps, portfolio and watchlist.",
  },
  {
    value: 1,
    suffix: "read per view",
    label: "Why it moved",
    note: "An AI read on every screen explaining the move from the evidence on it.",
  },
  {
    value: 10,
    suffix: "quarters",
    label: "Earnings history",
    note: "Surprise, beat rate, guidance and revision series per name.",
  },
  {
    value: 21,
    suffix: "actions / 30d",
    label: "Analyst coverage",
    note: "Ratings, targets and dispersion clustered by conviction and recency.",
  },
  {
    value: 6,
    suffix: "filers tracked",
    label: "Insiders & 13F",
    note: "See who is buying and selling — executive trades and institutional position changes, with the read on what it signals.",
  },
];

// ── Pricing ─────────────────────────────────────────────────
export type Plan = {
  name: string;
  price: string;
  blurb: string;
  popular: boolean;
  cta: string;
  features: string[];
};

export const plans: Plan[] = [
  {
    name: "Starter",
    price: "$0",
    blurb: "Explore every workspace with delayed data.",
    popular: false,
    cta: "Start free",
    features: ["All 14 workspaces", "Delayed market data", "Daily EOD recap"],
  },
  {
    name: "Pro",
    price: "$29",
    blurb: "Everything in STARTER plus",
    popular: true,
    cta: "Go Pro",
    features: ["Real-time data & alerts", "AI read in every view", "Portfolio & watchlist AI", "Scheduled recaps"],
  },
  {
    name: "Elite",
    price: "$79",
    blurb: "Everything in PRO plus",
    popular: false,
    cta: "Go Elite",
    features: [
      "Everything in Pro",
      "Multi-portfolio & 13F tracking",
      "Custom alert rules",
      "API & data export",
      "Priority support",
    ],
  },
];
