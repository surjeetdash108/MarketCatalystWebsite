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

export const hud: Hud[] = [
  { k: "S&P 500", v: "7,585.73", chg: "−0.45%", arrow: "▼", tone: "down", drift: 0, w: "38%", note: "prev close 7,619.98" },
  { k: "GOLD", v: "4,182.60", chg: "+0.83%", arrow: "▲", tone: "up", drift: 0, w: "62%", note: "haven bid, real yields easing" },
  { k: "VIX", v: "17.82", chg: "+4.21%", arrow: "▲", tone: "up", drift: 0, w: "52%", note: "vol bid into Fed week" },
  { k: "WTI CRUDE", v: "78.42", chg: "−1.80%", arrow: "▼", tone: "down", drift: 0, w: "44%", note: "energy sector −1.8%" },
];

export const hudRead =
  "Risk-off tape: gold catching the haven bid, volatility rising into Fed week, crude and energy leading the downside.";

// ── Marquee tape ────────────────────────────────────────────
export type TapeItem = { sym: string; chg: string; tone: Tone };

const tapeBase: TapeItem[] = [
  { sym: "NVDA", chg: "+3.42%", tone: "up" },
  { sym: "AAPL", chg: "−0.84%", tone: "down" },
  { sym: "MSFT", chg: "+1.19%", tone: "up" },
  { sym: "AMZN", chg: "+0.62%", tone: "up" },
  { sym: "META", chg: "−1.37%", tone: "down" },
  { sym: "TSLA", chg: "+4.08%", tone: "up" },
  { sym: "AVGO", chg: "+2.11%", tone: "up" },
  { sym: "JPM", chg: "−0.29%", tone: "down" },
  { sym: "XOM", chg: "+0.94%", tone: "up" },
  { sym: "LLY", chg: "−2.02%", tone: "down" },
  { sym: "NFLX", chg: "+1.76%", tone: "up" },
  { sym: "AMD", chg: "+3.05%", tone: "up" },
  { sym: "UNH", chg: "−0.51%", tone: "down" },
  { sym: "V", chg: "+0.38%", tone: "up" },
];

/** Doubled so the marquee can wrap seamlessly at half its scroll width. */
export const tape: TapeItem[] = [...tapeBase, ...tapeBase];

// ── Workspace panels ────────────────────────────────────────
export type SparkBar = { h: string; tone: Tone };
export type WinRow = { a: string; b: string; c: string; tone: Tone; w: string; d: string };

/**
 * One tab of a panel's terminal window.
 *
 * A tab is not just a different row set: the columns, the strip under the
 * table and the AI read all belong to it. That is the point of the tabs on
 * the landing page — switching them is meant to demonstrate that the read
 * follows the view, which is the product's whole argument.
 */
export type WinTab = {
  label: string;
  cols: [string, string, string, string];
  rows: WinRow[];
  /** The summary strip under the table. */
  foot: string;
  /** The panel's AI read while this tab is showing. */
  read: string;
};

export type Workspace = {
  num: string;
  name: string;
  tag: string;
  title: string;
  titleAccent?: string;
  body: string;
  metrics: { k: string; v: string; tone: Tone }[];
  spark: SparkBar[];
  win: {
    title: string;
    stamp: string;
    tabs: WinTab[];
  };
};

/** Deterministic (no Math.random) so server and client render identically. */
const spark = (seed: number, dir: 1 | -1): SparkBar[] =>
  Array.from({ length: 22 }, (_, i) => {
    const v = 26 + 62 * Math.abs(Math.sin((i + seed) * 0.72)) * (0.5 + (dir > 0 ? i : 22 - i) / 34);
    return {
      h: `${Math.min(100, v).toFixed(1)}%`,
      tone: (i > 14 ? (dir > 0 ? "up" : "down") : "idle") as Tone,
    };
  });

export const workspaces: Workspace[] = [
  {
    num: "01",
    name: "Movers",
    tag: "live",
    title: "What moved, before you ask why.",
    body: "Session leaders and laggards ranked against breadth, relative strength and regime — not just a percentage-change list.",
    metrics: [
      { k: "BREADTH", v: "68%", tone: "up" },
      { k: "REGIME", v: "Risk-on", tone: "amber" },
      { k: "RS 20D", v: "+4.2σ", tone: "up" },
    ],
    spark: spark(0, 1),
    win: {
      title: "movers",
      stamp: "15:24 ET",
      tabs: [
        {
          label: "Gainers",
          cols: ["SYMBOL", "LAST", "CHG", "RS 20D"],
          rows: [
            { a: "TSLA", b: "248.12", c: "+4.08%", tone: "up", w: "18px", d: "2.1σ" },
            { a: "NVDA", b: "141.66", c: "+3.42%", tone: "up", w: "15px", d: "1.8σ" },
            { a: "AMD", b: "162.40", c: "+3.05%", tone: "up", w: "13px", d: "1.4σ" },
            { a: "AVGO", b: "1,742.5", c: "+2.11%", tone: "up", w: "9px", d: "1.1σ" },
            { a: "NFLX", b: "902.18", c: "+1.76%", tone: "up", w: "7px", d: "0.8σ" },
          ],
          foot: "breadth 34% · regime risk-off",
          read: "Leadership is narrow — four names are carrying the tape while breadth stays negative underneath it.",
        },
        {
          label: "Losers",
          cols: ["SYMBOL", "LAST", "CHG", "RS 20D"],
          rows: [
            { a: "LLY", b: "806.30", c: "−2.02%", tone: "down", w: "18px", d: "−0.9σ" },
            { a: "META", b: "614.20", c: "−1.37%", tone: "down", w: "13px", d: "−0.6σ" },
            { a: "AAPL", b: "232.84", c: "−0.84%", tone: "down", w: "9px", d: "−0.4σ" },
            { a: "UNH", b: "512.06", c: "−0.51%", tone: "down", w: "6px", d: "−0.3σ" },
            { a: "JPM", b: "248.91", c: "−0.29%", tone: "down", w: "4px", d: "−0.1σ" },
          ],
          foot: "decliners 1.9 : 1 · healthcare heaviest",
          read: "Weakness is index-wide rather than single-name; defensives are absorbing the rotation.",
        },
        {
          label: "Volume",
          cols: ["SYMBOL", "VOLUME", "× ADV", "CHG"],
          rows: [
            { a: "NVDA", b: "412M", c: "2.4×", tone: "amber", w: "18px", d: "+3.42%" },
            { a: "TSLA", b: "268M", c: "1.9×", tone: "amber", w: "14px", d: "+4.08%" },
            { a: "AMD", b: "191M", c: "2.1×", tone: "amber", w: "16px", d: "+3.05%" },
            { a: "PLTR", b: "143M", c: "1.7×", tone: "amber", w: "11px", d: "+1.12%" },
            { a: "LLY", b: "38M", c: "1.4×", tone: "amber", w: "8px", d: "−2.02%" },
          ],
          foot: "session volume 1.6× the twenty-day median",
          read: "The volume sits in the names that moved — this is participation, not a thin drift.",
        },
      ],
    },
  },
  {
    num: "02",
    name: "Earnings",
    tag: "10 qtrs",
    title: "Earnings surprises, kept in context.",
    body: "Ten quarters of reported history per name, with surprise and revision series computed in-house from the normalised record.",
    metrics: [
      { k: "EPS SURP", v: "+8.4%", tone: "up" },
      { k: "BEAT RATE", v: "9/10", tone: "up" },
      { k: "GUIDE", v: "Raised", tone: "up" },
    ],
    spark: spark(4, 1),
    win: {
      title: "earnings",
      stamp: "post-close",
      tabs: [
        {
          label: "Reported",
          cols: ["QUARTER", "EPS", "SURP", "REV"],
          rows: [
            { a: "Q2 FY26", b: "1.24", c: "+8.4%", tone: "up", w: "18px", d: "+6.1%" },
            { a: "Q1 FY26", b: "1.11", c: "+5.1%", tone: "up", w: "13px", d: "+4.4%" },
            { a: "Q4 FY25", b: "0.98", c: "−1.3%", tone: "down", w: "7px", d: "+1.2%" },
            { a: "Q3 FY25", b: "0.94", c: "+3.7%", tone: "up", w: "11px", d: "+3.0%" },
            { a: "Q2 FY25", b: "0.86", c: "+2.2%", tone: "up", w: "9px", d: "+2.5%" },
          ],
          foot: "beat rate 9/10 · guidance raised",
          read: "Fourth consecutive beat; guidance raised while consensus still trails the reported trend.",
        },
        {
          label: "Upcoming",
          cols: ["SYMBOL", "DATE", "EST EPS", "WHEN"],
          rows: [
            { a: "NVDA", b: "Feb 26", c: "0.84", tone: "text", w: "18px", d: "After close" },
            { a: "CRM", b: "Feb 27", c: "2.61", tone: "text", w: "15px", d: "After close" },
            { a: "COST", b: "Mar 06", c: "3.92", tone: "text", w: "11px", d: "After close" },
            { a: "AVGO", b: "Mar 12", c: "1.48", tone: "text", w: "8px", d: "After close" },
            { a: "ORCL", b: "Mar 17", c: "1.34", tone: "text", w: "5px", d: "Pre-market" },
          ],
          foot: "5 reports in the next 21 sessions",
          read: "A heavy fortnight ahead: five covered names report, four of them after the close.",
        },
        {
          label: "Surprise",
          cols: ["QUARTER", "EST", "ACTUAL", "SURP"],
          rows: [
            { a: "Q2 FY26", b: "1.14", c: "1.24", tone: "up", w: "18px", d: "+8.4%" },
            { a: "Q1 FY26", b: "1.06", c: "1.11", tone: "up", w: "12px", d: "+5.1%" },
            { a: "Q4 FY25", b: "0.99", c: "0.98", tone: "down", w: "5px", d: "−1.3%" },
            { a: "Q3 FY25", b: "0.91", c: "0.94", tone: "up", w: "9px", d: "+3.7%" },
            { a: "Q2 FY25", b: "0.84", c: "0.86", tone: "up", w: "7px", d: "+2.2%" },
          ],
          foot: "average surprise +4.6% across ten quarters",
          read: "Surprise is positive and widening — the estimate is drifting behind the print, not the other way round.",
        },
      ],
    },
  },
  {
    num: "03",
    name: "Analyst Rating",
    tag: "clustered",
    title: "Conviction, not a rating average.",
    body: "Ratings and targets clustered by conviction and recency, so a crowded consensus reads differently from a contested one.",
    metrics: [
      { k: "REVISIONS", v: "21 up", tone: "amber" },
      { k: "TARGET", v: "$214", tone: "up" },
      { k: "SPREAD", v: "Narrow", tone: "amber" },
    ],
    spark: spark(9, 1),
    win: {
      title: "analyst rating",
      stamp: "30d window",
      tabs: [
        {
          label: "Actions",
          cols: ["FIRM", "ACTION", "TARGET", "CONV"],
          rows: [
            { a: "Morgan S.", b: "Upgrade", c: "$232", tone: "up", w: "17px", d: "High" },
            { a: "Goldman", b: "Raise", c: "$224", tone: "up", w: "14px", d: "High" },
            { a: "Barclays", b: "Maintain", c: "$210", tone: "amber", w: "10px", d: "Med" },
            { a: "UBS", b: "Raise", c: "$206", tone: "up", w: "9px", d: "Med" },
            { a: "Wells", b: "Downgrade", c: "$178", tone: "down", w: "6px", d: "Low" },
          ],
          foot: "21 up / 2 down · spread narrowing",
          read: "21 upward revisions in 30 days; dispersion is narrowing around a higher target band.",
        },
        {
          label: "Targets",
          cols: ["BAND", "FIRMS", "TARGET", "VS LAST"],
          rows: [
            { a: "Street high", b: "6", c: "$248", tone: "up", w: "18px", d: "+18%" },
            { a: "Last 7 days", b: "5", c: "$219", tone: "up", w: "12px", d: "+5%" },
            { a: "Median", b: "14", c: "$214", tone: "up", w: "11px", d: "+2%" },
            { a: "Initiations", b: "2", c: "$226", tone: "up", w: "13px", d: "+8%" },
            { a: "Street low", b: "3", c: "$178", tone: "down", w: "6px", d: "−15%" },
          ],
          foot: "median $214 · 2.3% above last",
          read: "The median target sits barely above the last print — the upside is in the bull case, not in consensus.",
        },
        {
          label: "Dispersion",
          cols: ["RATING", "FIRMS", "SHARE", "30D Δ"],
          rows: [
            { a: "Buy", b: "12", c: "41%", tone: "up", w: "18px", d: "+2" },
            { a: "Strong buy", b: "11", c: "38%", tone: "up", w: "17px", d: "+4" },
            { a: "Hold", b: "5", c: "17%", tone: "amber", w: "8px", d: "−3" },
            { a: "Sell", b: "1", c: "3%", tone: "down", w: "3px", d: "−1" },
            { a: "Underperform", b: "0", c: "0%", tone: "faint", w: "2px", d: "0" },
          ],
          foot: "consensus crowded · 79% buy-or-better",
          read: "A crowded book: four firms in five are buy-or-better, which leaves little room for another upgrade to move the price.",
        },
      ],
    },
  },
  {
    num: "04",
    name: "Insiders",
    tag: "EDGAR",
    title: "Filings read at source.",
    body: "Ownership, insider activity and material events are read from EDGAR directly rather than a summariser’s paraphrase of it.",
    metrics: [
      { k: "NET FLOW", v: "−$4.1M", tone: "down" },
      { k: "FILERS", v: "6", tone: "text" },
      { k: "FORM", v: "10b5-1", tone: "amber" },
    ],
    spark: spark(14, -1),
    win: {
      title: "insiders",
      stamp: "EDGAR feed",
      tabs: [
        {
          label: "Form 4",
          cols: ["FILER", "SIDE", "VALUE", "FORM"],
          rows: [
            { a: "CFO", b: "Sell", c: "−$2.6M", tone: "down", w: "18px", d: "10b5-1" },
            { a: "EVP Ops", b: "Sell", c: "−$1.5M", tone: "down", w: "12px", d: "10b5-1" },
            { a: "Director", b: "Sell", c: "−$0.4M", tone: "down", w: "6px", d: "Form 4" },
            { a: "SVP Eng", b: "Sell", c: "−$0.3M", tone: "down", w: "5px", d: "Form 4" },
            { a: "Director", b: "Buy", c: "+$0.7M", tone: "up", w: "8px", d: "Form 4" },
          ],
          foot: "net −$4.1M · 6 filers this week",
          read: "Net insider selling into strength, concentrated in one scheduled 10b5-1 plan.",
        },
        {
          label: "13F",
          cols: ["HOLDER", "ACTION", "SHARES", "% PORT"],
          rows: [
            { a: "Vanguard", b: "Add", c: "+1.2M", tone: "up", w: "18px", d: "8.4%" },
            { a: "BlackRock", b: "Add", c: "+0.9M", tone: "up", w: "14px", d: "7.1%" },
            { a: "Bridgewater", b: "New", c: "+0.5M", tone: "up", w: "9px", d: "0.9%" },
            { a: "Citadel", b: "Trim", c: "−0.3M", tone: "down", w: "6px", d: "1.2%" },
            { a: "Renaissance", b: "Exit", c: "−0.8M", tone: "down", w: "11px", d: "0.0%" },
          ],
          foot: "institutions net buyers · 3 adds / 2 cuts",
          read: "Institutions were net buyers last quarter while insiders sold — the two flows disagree, and that is the story.",
        },
        {
          label: "Events",
          cols: ["DATE", "EVENT", "FORM", "IMPACT"],
          rows: [
            { a: "Feb 14", b: "Buyback", c: "8-K", tone: "up", w: "18px", d: "+$4B" },
            { a: "Feb 09", b: "Shelf filed", c: "S-3", tone: "amber", w: "9px", d: "—" },
            { a: "Feb 02", b: "CFO change", c: "8-K", tone: "amber", w: "8px", d: "—" },
            { a: "Jan 28", b: "Dividend", c: "8-K", tone: "up", w: "12px", d: "+6%" },
            { a: "Jan 21", b: "Segment reorg", c: "8-K", tone: "faint", w: "4px", d: "—" },
          ],
          foot: "5 material filings in 30 days",
          read: "Two shareholder-return actions in a month — and the buyback lands the same week insiders filed to sell.",
        },
      ],
    },
  },
  {
    num: "05",
    name: "Your book",
    tag: "portfolio",
    title: "Your positions, explained daily.",
    body: "Portfolio and watchlist views inherit every read on the platform, attributed to the same sources and the same calendar.",
    metrics: [
      { k: "DAY P/L", v: "+0.9%", tone: "up" },
      { k: "FACTOR", v: "Rates", tone: "amber" },
      { k: "ALERTS", v: "3 new", tone: "up" },
    ],
    spark: spark(19, 1),
    win: {
      title: "your book",
      stamp: "day close",
      tabs: [
        {
          label: "Positions",
          cols: ["POSITION", "WEIGHT", "DAY", "CONTRIB"],
          rows: [
            { a: "AVGO", b: "12.4%", c: "+1.9%", tone: "up", w: "18px", d: "+41bps" },
            { a: "MSFT", b: "10.8%", c: "+1.2%", tone: "up", w: "13px", d: "+18bps" },
            { a: "NVDA", b: "9.1%", c: "+3.4%", tone: "up", w: "15px", d: "+15bps" },
            { a: "UNH", b: "6.2%", c: "−0.5%", tone: "down", w: "7px", d: "−12bps" },
            { a: "XOM", b: "4.5%", c: "+0.9%", tone: "up", w: "8px", d: "+6bps" },
          ],
          foot: "day +0.9% · factor driver: rates",
          read: "The day is factor-driven; three of five contributors share one macro exposure.",
        },
        {
          label: "Attribution",
          cols: ["FACTOR", "EXPOSURE", "DAY", "CONTRIB"],
          rows: [
            { a: "Rates", b: "+1.4σ", c: "−0.6%", tone: "down", w: "18px", d: "−38bps" },
            { a: "Momentum", b: "+0.9σ", c: "+1.1%", tone: "up", w: "14px", d: "+26bps" },
            { a: "Quality", b: "+0.4σ", c: "+0.3%", tone: "up", w: "8px", d: "+9bps" },
            { a: "Energy", b: "+0.2σ", c: "+0.8%", tone: "up", w: "7px", d: "+7bps" },
            { a: "Size", b: "−0.7σ", c: "−0.2%", tone: "down", w: "5px", d: "−5bps" },
          ],
          foot: "rates explains 61% of today’s move",
          read: "Almost two thirds of the day is one factor — this is a rates position wearing five tickers.",
        },
        {
          label: "Alerts",
          cols: ["TRIGGER", "NAME", "LEVEL", "AGE"],
          rows: [
            { a: "RS breakout", b: "NVDA", c: "1.8σ", tone: "up", w: "18px", d: "12m" },
            { a: "Earnings in 3d", b: "CRM", c: "—", tone: "amber", w: "10px", d: "1h" },
            { a: "Insider sell", b: "AVGO", c: "−$2.6M", tone: "down", w: "12px", d: "3h" },
            { a: "Target raised", b: "MSFT", c: "$520", tone: "up", w: "9px", d: "5h" },
            { a: "Stop proximity", b: "UNH", c: "−4.1%", tone: "down", w: "7px", d: "1d" },
          ],
          foot: "3 new since the open",
          read: "Three alerts fired since the open, and two of them are on the same position.",
        },
      ],
    },
  },
];

// ── Coverage stats ──────────────────────────────────────────
export type Stat = { value: number; suffix: string; label: string; note: string };

export const stats: Stat[] = [
  {
    value: 14,
    suffix: "workspaces",
    label: "Every view in one scroll",
    note: "Movers, earnings, analysts, insiders, macro, screener and your book.",
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
    blurb: "Real-time research for active investors.",
    popular: true,
    cta: "Go Pro",
    features: ["Real-time data & alerts", "AI read in every view", "Portfolio & watchlist AI", "Scheduled recaps"],
  },
  {
    name: "Elite",
    price: "$79",
    blurb: "Maximum firepower for serious investors.",
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
