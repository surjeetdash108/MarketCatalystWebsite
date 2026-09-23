// ============================================================
// WORKSPACE PANELS — miniature models of the app's screens
// ============================================================
// Eight of the app's screens, under their navigation labels
// (MarketCatalystUI app/dashboard/menu-items.ts). Every tab label and
// column header below is copied from the screen it models; where a
// screen's table is wider than the miniature window, it shows the most
// telling of its real columns rather than scrolling.
//
// The *values* are not real. They are generated from a seeded PRNG so
// server and client render identical markup (no hydration mismatch),
// and the panel renders them blurred: the page shows what each table
// holds without passing off invented figures as market data. Only the
// row identity (ticker, firm, sector…) and fixed UI text stay legible.

import type { Tone } from "./data";

// ── Types ───────────────────────────────────────────────────
export type SparkBar = { h: string; tone: Tone };

/** One rendered cell. `blur` cells are sample values, never real data. */
export type Cell = { v: string; tone: Tone; blur: boolean };
export type WinRow = { id: string; cells: Cell[] };

/**
 * One tab of a panel's terminal window. The columns, the strip under the
 * table and the AI read all belong to the tab — switching it demonstrates
 * that the read follows the view, which is the product's argument.
 */
export type WinTab = {
  label: string;
  cols: string[];
  /** Per-column alignment; the identity column reads left, figures right. */
  align: ("l" | "r" | "c")[];
  /** Per-column minimum width in px, sized to the longest header or value. */
  widths: number[];
  rows: WinRow[];
  /** The summary strip under the table. */
  foot: string;
  /** The panel's AI read while this tab is showing. */
  read: string;
};

export type Metric = { k: string; v: string; tone: Tone; blur: boolean };

export type Workspace = {
  num: string;
  name: string;
  tag: string;
  title: string;
  body: string;
  metrics: Metric[];
  spark: SparkBar[];
  win: { title: string; stamp: string; tabs: WinTab[] };
};

// ── Sample-value generator ──────────────────────────────────
type Kind =
  | "id" // the row's identity, legible
  | "const" // fixed UI text (a button, a badge), legible
  | "price" // $123.45
  | "pct" // +1.23%  (signed, coloured)
  | "arrow" // ▲ +1.23%
  | "pct0" // +12%
  | "pct1" // +1.2%
  | "eps" // $1.22
  | "mcap" // $1.24T / $340B / $8.4B
  | "rev" // $12.34B / $450M
  | "vol" // 12.5M
  | "mult" // 2.3×
  | "int" // 1,847
  | "signedInt" // +42
  | "num" // 0.87
  | "date" // Sep 18
  | "iso" // 2026-09-18
  | "pick" // one of `opts`
  | "text" // a line of words (headlines, summaries)
  | "txn"; // disposed 1,209,649 sh @ $286.41

type Col = {
  h: string;
  k: Kind;
  opts?: string[];
  /** Tone per option for `pick`, parallel to `opts`. */
  tones?: Tone[];
  min?: number;
  max?: number;
  dp?: number;
  pre?: string;
  suf?: string;
  align?: "l" | "r" | "c";
};

const col = (h: string, k: Kind, o: Omit<Col, "h" | "k"> = {}): Col => ({ h, k, ...o });

/** FNV-1a — turns a stable key into a PRNG seed. */
export const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

/** mulberry32 — tiny, deterministic, good enough for sample figures. */
export const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WORDS =
  "shares rally after guidance beat revenue outlook raised margin pressure demand chip orders cloud growth trims forecast analyst upgrade buyback approved deal talks regulator probe launch quarter record".split(
    " ",
  );

const commas = (n: number, dp = 0) => n.toLocaleString("en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp });

/**
 * Sign of a generated percentage: a tab's `bias` pins it (a gainers list is
 * all green), otherwise it is a coin flip weighted slightly to the upside.
 */
function gen(c: Col, id: string, r: () => number, bias: number): Cell {
  const between = (lo: number, hi: number) => lo + (hi - lo) * r();
  const sgn = bias > 0 ? 1 : bias < 0 ? -1 : r() < 0.58 ? 1 : -1;
  const signed = (n: number, dp: number, suf = "%") => `${n >= 0 ? "+" : "-"}${Math.abs(n).toFixed(dp)}${suf}`;
  const mag = (lo = 0.2, hi = 6) => sgn * between(lo, hi);
  const blurred = (v: string, tone: Tone = "text"): Cell => ({ v, tone, blur: true });

  switch (c.k) {
    case "id":
      return { v: id, tone: "text", blur: false };
    case "const":
      return { v: c.opts?.[0] ?? "", tone: c.tones?.[0] ?? "muted", blur: false };
    case "price":
      return blurred(`$${commas(between(c.min ?? 18, c.max ?? 900), 2)}`, "muted");
    case "pct": {
      const n = mag(c.min, c.max);
      return blurred(signed(n, c.dp ?? 2), n >= 0 ? "up" : "down");
    }
    case "arrow": {
      const n = mag(c.min, c.max);
      return blurred(`${n >= 0 ? "▲" : "▼"} ${signed(n, 2)}`, n >= 0 ? "up" : "down");
    }
    case "pct0": {
      const n = mag(c.min ?? 1, c.max ?? 30);
      return blurred(signed(n, 0), n >= 0 ? "up" : "down");
    }
    case "pct1": {
      const n = mag(c.min ?? 0.3, c.max ?? 9);
      return blurred(signed(n, 1), n >= 0 ? "up" : "down");
    }
    case "eps":
      return blurred(`$${between(c.min ?? 0.2, c.max ?? 4.5).toFixed(2)}`, "muted");
    case "mcap": {
      const x = r();
      const v = x < 0.3 ? `$${between(1, 4).toFixed(2)}T` : x < 0.8 ? `$${Math.round(between(40, 900))}B` : `$${between(2, 39).toFixed(1)}B`;
      return blurred(v, "muted");
    }
    case "rev":
      return blurred(r() < 0.7 ? `$${between(1, 90).toFixed(2)}B` : `$${Math.round(between(120, 990))}M`, "muted");
    case "vol":
      return blurred(`${between(c.min ?? 1, c.max ?? 480).toFixed(1)}M`, "muted");
    case "mult":
      return blurred(`${between(c.min ?? 0.6, c.max ?? 4.2).toFixed(1)}×`, "amber");
    case "int":
      return blurred(`${c.pre ?? ""}${commas(Math.round(between(c.min ?? 1, c.max ?? 99)))}${c.suf ?? ""}`, c.tones?.[0] ?? "muted");
    case "signedInt": {
      const dp = c.dp ?? 0;
      const raw = mag(c.min ?? 1, c.max ?? 60);
      const n = dp > 0 ? raw : Math.round(raw);
      return blurred(`${n >= 0 ? "+" : "-"}${c.pre ?? ""}${commas(Math.abs(n), dp)}${c.suf ?? ""}`, n >= 0 ? "up" : "down");
    }
    case "num":
      return blurred(`${c.pre ?? ""}${between(c.min ?? 0, c.max ?? 10).toFixed(c.dp ?? 2)}${c.suf ?? ""}`, c.tones?.[0] ?? "muted");
    case "date":
      return blurred(`${MONTHS[8 + Math.floor(r() * 2)]} ${1 + Math.floor(r() * 28)}`, "faint");
    case "iso":
      return blurred(`2026-${String(1 + Math.floor(r() * 9)).padStart(2, "0")}-${String(1 + Math.floor(r() * 28)).padStart(2, "0")}`, "faint");
    case "pick": {
      const opts = c.opts ?? ["—"];
      const i = Math.floor(r() * opts.length);
      return blurred(opts[i], c.tones?.[i] ?? "text");
    }
    case "text": {
      const n = 3 + Math.floor(r() * 4);
      return blurred(Array.from({ length: n }, () => WORDS[Math.floor(r() * WORDS.length)]).join(" "), "muted");
    }
    case "txn": {
      const verb = sgn > 0 ? "acquired" : "disposed";
      const shares = Math.round(between(c.min ?? 20000, c.max ?? 15000000));
      const price = between(5, 400);
      return blurred(`${verb} ${commas(shares)} sh @ $${price.toFixed(2)}`, "muted");
    }
  }
}

type TabSpec = {
  label: string;
  cols: Col[];
  rows: string[];
  /** +1 all positive, −1 all negative, 0 mixed. */
  bias?: number;
  foot: string;
  read: string;
};

/** Mono type in the window runs ~7.1px a character; clamp keeps a headline column from taking the whole row. */
const colWidth = (chars: number) => Math.round(Math.min(190, Math.max(48, chars * 7.1 + 12)));

function tab(ws: string, t: TabSpec): WinTab {
  const rows = t.rows.map((id) => {
    const r = rng(hash(`${ws}|${t.label}|${id}`));
    return { id, cells: t.cols.map((c) => gen(c, id, r, t.bias ?? 0)) };
  });
  return {
    label: t.label,
    cols: t.cols.map((c) => c.h),
    align: t.cols.map((c) => c.align ?? (c.k === "id" || c.k === "text" ? "l" : "r")),
    widths: t.cols.map((c, j) => colWidth(Math.max(c.h.length, ...rows.map((r) => r.cells[j].v.length)))),
    rows,
    foot: t.foot,
    read: t.read,
  };
}

/** Deterministic (no Math.random) so server and client render identically. */
const spark = (seed: number, dir: 1 | -1): SparkBar[] =>
  Array.from({ length: 22 }, (_, i) => {
    const v = 26 + 62 * Math.abs(Math.sin((i + seed) * 0.72)) * (0.5 + (dir > 0 ? i : 22 - i) / 34);
    return {
      h: `${Math.min(100, v).toFixed(1)}%`,
      tone: (i > 14 ? (dir > 0 ? "up" : "down") : "idle") as Tone,
    };
  });

/** A metric chip. Sample figures blur; fixed UI text (`clear`) does not. */
const m = (k: string, v: string, tone: Tone = "text", clear = false): Metric => ({ k, v, tone, blur: !clear });

type WsSpec = Omit<Workspace, "num" | "spark" | "win"> & {
  spark: [number, 1 | -1];
  win: { title: string; stamp: string; tabs: TabSpec[] };
};

// ── Shared column sets (identical in the app across these tabs) ──
const MOVERS_COLS = (change: string, bias: number): Col[] => [
  col("Company", "id"),
  col("Price", "price"),
  col(change, "arrow", { min: bias === 0 ? 0.3 : 1.2, max: 14 }),
  col("RVOL", "mult"),
  col("Mkt Cap", "mcap"),
  col("Why It Moved", "const", { opts: ["📰 News"], tones: ["up"], align: "c" }),
];

const EARNINGS_COLS: Col[] = [
  col("Company", "id"),
  col("Date", "date"),
  col("Surprise", "pct0", { min: 1, max: 24 }),
  col("Actual", "eps"),
  col("Consensus", "eps"),
  col("1YR Ago", "eps"),
  col("Actual Rev", "rev"),
  col("Pre-Mkt", "pct1", { min: 0, max: 2 }),
  col("After-Hrs", "pct1", { min: 0, max: 2 }),
  col("Guidance", "pick", {
    opts: ["▲ Raised", "▼ Cut", "Mixed", "Reaffirmed", "—"],
    tones: ["up", "down", "amber", "muted", "faint"],
  }),
];

const SCREENER_COLS: Col[] = [
  col("Symbol", "id"),
  col("Price", "price"),
  col("Day change", "pct"),
  col("RS rating", "int", { min: 60, max: 99, suf: "/99" }),
  col("Tech rating", "pick", { opts: ["Strong Buy", "Buy", "Neutral"], tones: ["up", "up", "muted"] }),
  col("Rel. volume", "mult"),
];

// ── The screens on the landing page ─────────────────────────
// The original five (movers, earnings, analysts, ownership, portfolio)
// plus the screener, macro & VIX and IPOs. The rest of the app
// is named in the section note rather than shown.
const SPECS: WsSpec[] = [
  {
    name: "Movers",
    tag: "live",
    title: "What moved, before you ask why.",
    body: "Top gainers and losers, unusual volume and the five-day leaders — each ranked with relative volume, market cap, sector and the news behind the move.",
    metrics: [m("TOP GAINERS", "100", "up"), m("TOP LOSERS", "100", "down"), m("UNUSUAL VOLUME", "24", "amber")],
    spark: [0, 1],
    win: {
      title: "movers",
      stamp: "session",
      tabs: [
        {
          label: "Top Gainers",
          cols: MOVERS_COLS("Change", 1),
          rows: ["CRML", "PRTH", "GRAL", "NUAI", "SECZ"],
          bias: 1,
          foot: "top 100 gainers + 100 losers · ranked by session move",
          read: "Leadership is narrow when a handful of names carry the tape — relative volume shows whether the move has participation.",
        },
        {
          label: "Top Losers",
          cols: MOVERS_COLS("Change", -1),
          rows: ["LLY", "META", "AAPL", "UNH", "JPM"],
          bias: -1,
          foot: "top 100 gainers + 100 losers · ranked by session move",
          read: "The losers list reads by sector — weakness concentrated in one group is rotation, spread across all of them is risk-off.",
        },
        {
          label: "Unusual Volume",
          cols: MOVERS_COLS("Change", 0),
          rows: ["PLTR", "SMCI", "COIN", "RIVN", "SOFI"],
          foot: "tracked universe · ranked by relative volume",
          read: "Volume leads price — names trading several times their average are where the next move is being decided.",
        },
        {
          label: "Weekly Gainers",
          cols: MOVERS_COLS("5-day", 1),
          rows: ["ORCL", "MU", "ANET", "DELL", "CRWD"],
          bias: 1,
          foot: "tracked universe · ranked by 5-day move",
          read: "The five-day leaders separate a one-session pop from a move that is still being bought.",
        },
        {
          label: "Weekly Losers",
          cols: MOVERS_COLS("5-day", -1),
          rows: ["INTC", "NKE", "PFE", "BA", "DIS"],
          bias: -1,
          foot: "tracked universe · ranked by 5-day move",
          read: "Persistent five-day weakness is distribution, not noise — check the news column for the reason.",
        },
      ],
    },
  },
  {
    name: "Earnings Hub",
    tag: "calendar",
    title: "Earnings surprises, kept in context.",
    body: "Every report of the day, week or month with EPS and revenue against consensus, the pre-market and after-hours reaction, guidance — and a playbook of how each name trades when it reports.",
    metrics: [m("TYPICAL MOVE", "±4.2%", "amber"), m("ON A BEAT", "+3.4%", "up"), m("GAP HOLDS", "5 of 7", "text")],
    spark: [4, 1],
    win: {
      title: "earnings hub",
      stamp: "Day · At a glance",
      tabs: [
        {
          label: "All",
          cols: EARNINGS_COLS,
          rows: ["AVAV", "CTAS", "PAYX", "CCL", "JBL"],
          foot: "All · Month · 25 shown per table",
          read: "Every report on the calendar, before open and after close together, with the pre- and after-market reaction alongside it.",
        },
        {
          label: "Moved pre-mkt",
          cols: EARNINGS_COLS,
          rows: ["CIEN", "SAIL", "ABM", "FCEL", "YEXT"],
          foot: "Moved pre-mkt · Before open · click ▸ for the last 4 reported quarters",
          read: "Pre-market reporters, each with its surprise, the revenue print and how the stock is trading before the bell.",
        },
        {
          label: "Moved after-hrs",
          cols: EARNINGS_COLS,
          rows: ["ORCL", "ADBE", "MU", "NKE", "COST"],
          foot: "Moved after-hrs · After close · click ▸ for the last 4 reported quarters",
          read: "After-close reports carry the most information — the after-hours column shows the verdict before the next session.",
        },
      ],
    },
  },
  {
    name: "Analyst Actions",
    tag: "per-firm",
    title: "Conviction, not a rating average.",
    body: "Consensus and price targets, every per-firm rating change, the analysts behind them and cluster alerts when several firms act on the same name.",
    metrics: [m("UPGRADES", "21", "up"), m("DOWNGRADES", "6", "down"), m("INITIATIONS", "4", "text")],
    spark: [9, 1],
    win: {
      title: "analyst actions",
      stamp: "FMP · Polygon",
      tabs: [
        {
          label: "Analysts",
          cols: [
            col("Analyst / firm", "id"),
            col("Actions", "int", { min: 300, max: 800 }),
            col("Upgrades", "int", { min: 40, max: 260, tones: ["up"] }),
            col("Downgrades", "int", { min: 40, max: 250, tones: ["down"] }),
            col("Initiations", "int", { min: 0, max: 3 }),
            col("Tickers", "int", { min: 140, max: 380 }),
            col("Latest", "date"),
          ],
          rows: ["JP Morgan", "Morgan Stanley", "Barclays", "Wells Fargo", "UBS"],
          foot: "221 firms · ranked by rating changes",
          read: "The firms, ranked by how active they are — and which way they have been leaning.",
        },
        {
          label: "Consensus & price targets",
          cols: [
            col("Ticker", "id"),
            col("Ratings", "pick", { opts: ["32B / 5H / 1S", "28B / 9H / 2S", "41B / 3H / 0S", "18B / 14H / 4S"] }),
            col("Target", "price", { min: 90, max: 950 }),
            col("Upside", "pct0", { min: 2, max: 30 }),
          ],
          rows: ["NVDA", "MSFT", "AMZN", "META", "AVGO"],
          foot: "top 8 by buy count · live",
          read: "Consensus is shown as a split, not an average — a crowded buy book reads differently from a contested one.",
        },
        {
          label: "Per-firm analyst actions",
          cols: [
            col("Ticker", "id"),
            col("Firm", "pick", { opts: ["Morgan Stanley", "Goldman", "Barclays", "UBS", "Wells Fargo", "Jefferies"] }),
            col("Action", "pick", { opts: ["Upgrade", "Downgrade", "Initiate", "Maintain"], tones: ["up", "down", "text", "muted"] }),
            col("Previous → New", "pick", { opts: ["Hold → Buy", "Buy → Hold", "Neutral → Buy", "Buy → Sell"] }),
            col("PT", "price", { min: 90, max: 950 }),
            col("Upside", "pct0", { min: 2, max: 30 }),
          ],
          rows: ["NVDA", "TSLA", "CRM", "UNH", "ORCL"],
          foot: "All · Upgrades · Downgrades · Initiations · Clusters only",
          read: "Every rating change by every firm, with the grade it moved from and the target it set.",
        },
      ],
    },
  },
  {
    name: "Ownership",
    tag: "EDGAR",
    title: "Filings read at source.",
    body: "Insider Form 4 transactions and 13F institutional ownership read from SEC EDGAR directly — who is buying, who is selling and how the holder base is changing.",
    metrics: [m("FILINGS", "312", "text"), m("NET", "−$4.1M", "down"), m("13F FILERS", "1,847", "text")],
    spark: [14, -1],
    win: {
      title: "ownership",
      stamp: "SEC EDGAR",
      tabs: [
        {
          label: "Insider activity",
          cols: [
            col("Ticker", "id"),
            col("Side", "pick", { opts: ["BUY", "SELL", "SELL"], tones: ["up", "down", "down"] }),
            col("Insider / owner", "pick", {
              opts: ["Filer", "Executive Chair", "President", "See Remarks", "Director", "10% Owner", "CFO"],
            }),
            col("Transaction", "txn", { min: 20000, max: 15000000 }),
            col("Value", "signedInt", { pre: "$", suf: "M", min: 20, max: 900, dp: 1 }),
            col("Date", "iso"),
          ],
          rows: ["BTSG", "AUR", "AMZN", "BABA", "PLTR"],
          foot: "All · Buys · Sells · live · SEC EDGAR Form 4",
          read: "Open-market buys and sales, valued — the trades that carry a signal, separated from grants and exercises.",
        },
        {
          label: "13F institutional",
          cols: [
            col("Ticker", "id"),
            col("As of", "const", { opts: ["Q2 '26"] }),
            col("13F filers", "int", { min: 900, max: 6600 }),
            col("Inst. %", "num", { min: 40, max: 145, dp: 1, suf: "%" }),
            col("Q1 '26", "int", { min: 900, max: 6500 }),
            col("Q4 '25", "int", { min: 900, max: 6400 }),
            col("Q3 '25", "int", { min: 900, max: 6200 }),
            col("Filers QoQ", "signedInt", { min: 3, max: 170 }),
            col("Shares QoQ", "signedInt", { suf: "M", min: 1, max: 40 }),
          ],
          rows: ["MSFT", "AMZN", "AAPL", "NVDA", "GOOGL"],
          foot: "13F · most recent quarter · sort by Owners or Move",
          read: "Institutional ownership by ticker — the filer count quarter by quarter shows whether the holder base is growing.",
        },
      ],
    },
  },
  {
    name: "Portfolio",
    tag: "yours",
    title: "Your positions, explained daily.",
    body: "Your holdings with live prices, day P/L and unrealized P/L, an AI summary of the drivers, leaders and laggards — and every holding opens into its chart and full analysis.",
    metrics: [m("HOLDINGS", "8", "text"), m("TODAY", "+$1.2K", "up"), m("UNREALIZED", "+$8.4K", "up")],
    spark: [19, 1],
    win: {
      title: "portfolio",
      stamp: "POLYGON",
      tabs: [
        {
          label: "Holdings",
          cols: [col("Ticker", "id"), col("Price", "price"), col("Day", "arrow", { max: 4 }), col("Unrealized", "signedInt", { pre: "$", suf: "K", min: 1, max: 40 })],
          rows: ["AVGO", "MSFT", "NVDA", "UNH", "XOM"],
          foot: "holdings · value · today · unrealized",
          read: "Every holding with its day move and unrealized P/L — the biggest driver of the day is named in the AI summary.",
        },
        {
          label: "Portfolio Pulse",
          cols: [
            col("Ticker", "id"),
            col("Position size", "pick", { opts: ["Small", "Medium", "Large"] }),
            col("Conviction", "pick", { opts: ["High", "Medium", "Low"], tones: ["up", "amber", "muted"] }),
            col("Day", "pct", { max: 4 }),
          ],
          rows: ["AVGO", "MSFT", "NVDA", "UNH", "XOM"],
          foot: "position size · conviction · day",
          read: "Position size and conviction next to the day's move — so a loss on a high-conviction name stands out.",
        },
      ],
    },
  },
  {
    name: "Screener",
    tag: "20 presets",
    title: "Filter the market to your setup.",
    body: "Twenty preset screens plus relative strength, growth, technical rating and liquidity filters — and every match opens straight into its chart and full analysis.",
    metrics: [m("PRESETS", "20", "text", true), m("MATCHES", "27", "up"), m("FILTER GROUPS", "4", "text", true)],
    spark: [7, 1],
    win: {
      title: "screener",
      stamp: "POLYGON",
      tabs: [
        {
          label: "Briefing growth screen",
          cols: SCREENER_COLS,
          rows: ["NVDA", "PLTR", "ANET", "CRWD", "UBER"],
          foot: "6-mo RS ≥ 80 · sales & EPS growth · expanding margins",
          read: "Growth with expanding margins is rare — the survivors of this screen tend to share one theme.",
        },
        {
          label: "CAN SLIM leaders",
          cols: SCREENER_COLS,
          rows: ["AVGO", "NFLX", "APP", "HOOD", "VRT"],
          foot: "O'Neil: EPS+sales accel · RS ≥ 90 · near highs",
          read: "Accelerating earnings and sales, top-decile relative strength, trading near highs.",
        },
        {
          label: "Unusual volume",
          cols: SCREENER_COLS,
          rows: ["SMCI", "COIN", "SOFI", "RKLB", "IONQ"],
          foot: "RVOL > 3× · price > $5",
          read: "Names trading well above their normal volume — the place to look before the move shows up in price.",
        },
        {
          label: "Deep value (low P/E + FCF)",
          cols: SCREENER_COLS,
          rows: ["INTC", "F", "BAC", "T", "C"],
          foot: "P/E < 12 · FCF yield > 8%",
          read: "Cheap on earnings and cash flow — the question the technical rating answers is whether anyone is buying yet.",
        },
      ],
    },
  },
  {
    name: "Macro & VIX",
    tag: "this week",
    title: "The macro week, before it lands.",
    body: "The economic calendar with estimate, actual and prior for every release, the VIX, the most volatility-sensitive stocks and the market holiday schedule.",
    metrics: [m("VIX", "17.82", "up"), m("THIS WEEK", "18 events", "text"), m("IMPACT", "High · Med · Low", "amber", true)],
    spark: [6, 1],
    win: {
      title: "macro & vix",
      stamp: "Sep 21 – Sep 25, 2026",
      tabs: [
        {
          label: "Economic calendar",
          cols: [
            col("Event", "id"),
            col("Day", "pick", { opts: ["MON 21", "TUE 22", "WED 23", "THU 24", "FRI 25"] }),
            col("Impact", "pick", { opts: ["High", "Med", "Low"], tones: ["down", "amber", "muted"] }),
            col("Previous", "num", { min: 0.1, max: 4.5, suf: "%" }),
            col("Estimate", "num", { min: 0.1, max: 4.5, suf: "%" }),
            col("Actual", "num", { min: 0.1, max: 4.5, suf: "%" }),
          ],
          rows: ["S&P Global Composite PMI", "Initial Jobless Claims", "New Home Sales", "Durable Goods Orders MoM", "Current Account"],
          foot: "Economic calendar · FMP · High first, then Med, then Low",
          read: "The week hangs on the high-impact prints — each one is compared against the estimate and the prior reading.",
        },
        {
          label: "VIX-sensitive stocks",
          cols: [
            col("Stock", "id"),
            col("Beta", "num", { min: 1.6, max: 3.2, tones: ["amber"] }),
            col("30d Vol", "num", { min: 30, max: 90, dp: 1, suf: "%" }),
            col("Div yield", "num", { min: 0, max: 3, suf: "%", tones: ["up"] }),
          ],
          rows: ["SMCI", "COIN", "MSTR", "AFRM", "RIVN"],
          foot: "Highest-beta names — most sensitive to volatility spikes",
          read: "When the VIX spikes these are the names that move first — ranked by beta, highest first.",
        },
        {
          label: "Market holidays",
          cols: [
            col("Holiday", "id"),
            col("Date", "pick", {
              opts: ["Thu, Nov 26", "Fri, Nov 27", "Thu, Dec 24", "Fri, Dec 25", "Fri, Jan 1", "Mon, Jan 18"],
            }),
            col("Status", "pick", { opts: ["Closed", "Early close"], tones: ["down", "amber"] }),
          ],
          rows: ["Thanksgiving Day", "Day after Thanksgiving", "Christmas Eve", "Christmas Day", "New Years Day", "Martin Luther King, Jr. Day"],
          foot: "Market holidays · Polygon",
          read: "Closed and early-close sessions, flagged ahead so a thin tape is expected rather than a surprise.",
        },
        {
          label: "Dividend history",
          cols: [col("Year", "id"), col("Annual div", "eps"), col("YoY growth", "pct1", { min: 1, max: 14 })],
          rows: ["2026", "2025", "2024", "2023", "2022"],
          bias: 1,
          foot: "Year-by-year breakdown · click any VIX-sensitive stock",
          read: "Every stock opens into its dividend record — latest payment, streak, frequency and five-year growth.",
        },
      ],
    },
  },
  {
    name: "IPOs",
    tag: "calendar",
    title: "New listings, from filing to first print.",
    body: "Recent IPO performance against the offer price, the SEC registration pipeline and the live IPO calendar with range and status.",
    metrics: [m("TRADING ABOVE OFFER", "78/125", "up"), m("BEST PERFORMER", "TCGLF +667%", "up"), m("MEDIAN SINCE IPO", "+0.90%", "up")],
    spark: [3, 1],
    win: {
      title: "ipos",
      stamp: "Polygon · SEC EDGAR",
      tabs: [
        {
          label: "Recent IPO performance",
          cols: [
            col("Company", "id"),
            col("Sector", "const", { opts: ["—"] }),
            col("IPO date", "iso"),
            col("Shares", "vol", { min: 1, max: 60 }),
            col("Deal size", "num", { min: 20, max: 900, dp: 1, pre: "$", suf: "M" }),
            col("Offer", "price", { min: 14, max: 45 }),
            col("Current", "price", { min: 10, max: 95 }),
            col("Day 1", "pct", { max: 60 }),
            col("Since IPO", "pct", { max: 130 }),
          ],
          rows: ["PTT", "AMRO", "BMB", "ETRA", "HNUC"],
          foot: "Aftermarket performance · click any row to open stock detail",
          read: "Recent deals measured from the offer price — how they traded on day one and where they are now.",
        },
        {
          label: "Upcoming pipeline",
          cols: [
            col("Company", "id"),
            col("Form", "pick", { opts: ["S-1", "S-1/A", "424B4"], tones: ["amber", "amber", "amber"] }),
            col("Filed", "iso"),
            col("Filing", "const", { opts: ["SEC filing →"], tones: ["up"] }),
          ],
          rows: ["Cerebras Systems", "Medline Industries", "Navan, Inc.", "StubHub Holdings", "Lendbuzz"],
          foot: "SEC-EDGAR registration filings (S-1 / 424B)",
          read: "The raw registration pipeline from EDGAR — the deals before they reach the calendar.",
        },
        {
          label: "Live IPO Calendar",
          cols: [
            col("Company", "id"),
            col("Symbol", "pick", { opts: ["CBRS", "MDLN", "NAVN", "STUB", "LBZ"] }),
            col("Date", "iso"),
            col("Exchange", "pick", { opts: ["NASDAQ", "NYSE"] }),
            col("Price", "pick", { opts: ["$16.00–$18.00", "$28.00–$31.00", "$22.00", "$19.00–$21.00"] }),
            col("Status", "pick", { opts: ["Expected", "Priced", "Filed", "Pending"], tones: ["amber", "up", "amber", "amber"] }),
          ],
          rows: ["Cerebras", "Medline", "Navan", "StubHub", "Lendbuzz"],
          foot: "live · Polygon",
          read: "Expected, priced and pending deals with their range — the window's health in one table.",
        },
      ],
    },
  },
];

export const workspaces: Workspace[] = SPECS.map((s, i) => {
  const num = String(i + 1).padStart(2, "0");
  return {
    ...s,
    num,
    spark: spark(...s.spark),
    win: { ...s.win, tabs: s.win.tabs.map((t) => tab(s.name, t)) },
  };
});
