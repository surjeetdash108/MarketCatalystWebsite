// ============================================================
// FEATURES PAGE — content model
// ============================================================
// Every screen the terminal ships, in the order the /features index and
// /features/[slug] detail pages render it. The three "AI" entries are the
// interpretive layer that reads every other workspace (What Matters Now, Why
// It Moved, the AI stock read) — everything after it is a workspace, grouped
// the way the app's own navigation groups it.
//
// Cross-checked against MarketCatalystUI's app/dashboard/menu-items.ts (the
// nav's actual source of truth): 18 visible items there, one of which
// (label "Search", slug "stock") is the same screen as the "AI Stock Read"
// entry below rather than a workspace of its own — stock.tsx is both the
// ticker search and the AI-read stock page. That leaves 17 distinct
// workspaces, grouped exactly as menu-items.ts groups them ("Market
// Recaps", not "Recaps").
//
// This list is content, not data pulled from the product: keep names aligned
// with components/home/workspaces.ts and components/marketing/carousel/
// workspaces.ts where a screen appears in both places, so a reader does not
// meet two different names for the same thing.

export type FeatureGroup = "Home" | "Markets" | "Research" | "Market Recaps" | "My Workspace";

export type Feature = {
  slug: string;
  group: "AI" | FeatureGroup;
  title: string;
  /** One line, used on the index card and the nav chip. */
  blurb: string;
  /** The detail page's standfirst — one or two sentences. */
  lede: string;
  /** "What you get" — always four. */
  points: string[];
  /** The AI-read panel's sample line on the detail page. */
  ai: string;
};

const RAW: Feature[] = [
  {
    slug: "what-matters-now",
    group: "AI",
    title: "What Matters Now",
    blurb: "A live AI synthesis of the session — what happened and why it matters.",
    lede: "The top of every dashboard: an AI summary of the market that updates through the day and cites the headlines it was built from.",
    points: [
      "Live market synthesis, refreshed through the session",
      "Headline count and timestamp on every summary",
      "Powers the daily and weekly recaps",
      "Links straight into the tickers it mentions",
    ],
    ai: "S&P −0.72%, volatility up 6.54%, gold offered, crude firmer.",
  },
  {
    slug: "why-it-moved",
    group: "AI",
    title: "Why It Moved",
    blurb: "Hover any ticker for an instant explanation of the move.",
    lede: "Anywhere a ticker appears, hover it to see the change, relative volume, strength rank and the news catalyst behind the move.",
    points: [
      "Session change and relative volume",
      "Relative-strength rank vs. the market",
      "Primary news catalyst from the last 48 hours",
      "One click through to the full stock page",
    ],
    ai: "A move with 3× normal volume and a fresh catalyst is a move with conviction.",
  },
  {
    slug: "ai-read",
    group: "AI",
    title: "AI Stock Read",
    blurb: "Every stock page summarised — trend, levels, strength and risk.",
    lede: "Open any ticker and the AI has already done the homework — charts, levels and analyst views turned into one clear story.",
    points: [
      "Trend vs. 50- and 200-day averages",
      "Support and resistance from the 52-week range",
      "Relative strength, volume and event risk",
      "Analyst consensus, target and upside",
    ],
    ai: "Downtrend below both moving averages; next earnings is the event to watch.",
  },
  {
    slug: "dashboard",
    group: "Home",
    title: "Dashboard",
    blurb: "Tape, AI summary, movers, earnings and heatmap on one screen.",
    lede: "Your starting point: the live tape, What Matters Now, most-searched tickers, today's earnings, movers and a sector heatmap.",
    points: [
      "Live index, commodity and crypto tape",
      "What Matters Now AI summary",
      "Most-searched tickers and today's earnings",
      "Movers and heatmap at a glance",
    ],
    ai: "The whole market on one screen, before you open a single tab.",
  },
  {
    slug: "live-feed",
    group: "Home",
    title: "Live Feed",
    blurb: "Breaking market news, tagged to the tickers it moves.",
    lede: "A streaming feed of market news, each story tagged to its tickers and sorted by what's moving now.",
    points: [
      "Real-time headlines as they land",
      "Ticker tags on every story",
      "Filter by watchlist or sector",
      "Jump from story to stock page",
    ],
    ai: "The news, already connected to the stocks it affects.",
  },
  {
    slug: "earnings-hub",
    group: "Markets",
    title: "Earnings Hub",
    blurb: "Every report vs. consensus, with pre- and after-market reaction.",
    lede: "Month, week or day views of every report — EPS and revenue against consensus, the reaction, guidance and how each name typically trades.",
    points: [
      "EPS and revenue vs. consensus",
      "Pre-market and after-hours reaction",
      "Guidance raised, cut or mixed",
      "Historical reaction overlays",
    ],
    ai: "Before-open and after-close reports side by side, with the reaction alongside.",
  },
  {
    slug: "movers",
    group: "Markets",
    title: "Movers",
    blurb: "Top gainers, losers, unusual volume and weekly leaders.",
    lede: "Ranked by session move with market cap, relative volume, sector and the news behind each move.",
    points: [
      "Top gainers and losers",
      "Unusual volume",
      "Weekly gainers and losers",
      "Filter by sector and market cap",
    ],
    ai: "Relative volume shows whether a move has real participation.",
  },
  {
    slug: "heatmap",
    group: "Markets",
    title: "Heatmap",
    blurb: "Live sector and stock performance at a glance.",
    lede: "The market as a map — every sector and stock sized by market cap and coloured by today's move.",
    points: [
      "Sized by market cap, coloured by move",
      "Drill from sector to stock",
      "Index and timeframe switches",
      "Hover for why it moved",
    ],
    ai: "See in a second whether the move is broad or concentrated.",
  },
  {
    slug: "analyst-actions",
    group: "Markets",
    title: "Analyst Actions",
    blurb: "Upgrades, downgrades, initiations and price targets from 221 firms.",
    lede: "Every rating change and price target, by firm and by ticker — with cluster alerts when several firms act on the same name.",
    points: [
      "Upgrades, downgrades and initiations",
      "Consensus and price targets",
      "Per-firm activity and leaning",
      "Cluster alerts across firms",
    ],
    ai: "Firms ranked by activity — and which way they've been leaning.",
  },
  {
    slug: "macro-vix",
    group: "Markets",
    title: "Macro & VIX",
    blurb: "Economic calendar, VIX-sensitive stocks and market holidays.",
    lede: "The macro backdrop: economic releases with estimate, actual and prior, the VIX and the stocks most sensitive to it.",
    points: [
      "Economic calendar: estimate, actual, prior",
      "VIX level and trend",
      "VIX-sensitive stocks",
      "Market holidays and early closes",
    ],
    ai: "Know which print could move the tape before it lands.",
  },
  {
    slug: "screener",
    group: "Research",
    title: "Screener",
    blurb: "Twenty presets plus strength, growth and technical filters.",
    lede: "Find setups fast with ready-made presets or build your own from strength, growth, technical and liquidity filters.",
    points: [
      "Twenty ready-made presets",
      "Relative strength and growth filters",
      "Technical rating and liquidity",
      "Save and reuse screens",
    ],
    ai: "Start from a preset, then narrow to your edge.",
  },
  {
    slug: "themes",
    group: "Research",
    title: "Themes",
    blurb: "Stocks grouped by the market themes driving them.",
    lede: "The market organised by narrative — see which themes are leading and the stocks inside each.",
    points: [
      "Curated market themes",
      "Theme performance over time",
      "Constituent stocks for each",
      "Leaders and laggards per theme",
    ],
    ai: "Which stories the market is paying for this week.",
  },
  {
    slug: "ipos",
    group: "Research",
    title: "IPOs",
    blurb: "Performance vs. offer, the SEC pipeline and the IPO calendar.",
    lede: "Every listing tracked from filing to first trade — and how it has done since.",
    points: [
      "Performance vs. offer price",
      "SEC registration pipeline",
      "Live IPO calendar",
      "Lock-up and quiet-period dates",
    ],
    ai: "Which new listings are holding their offer — and which aren't.",
  },
  {
    slug: "ownership",
    group: "Research",
    title: "Ownership",
    blurb: "Insider trades and 13F institutional holdings from SEC EDGAR.",
    lede: "Form 4 insider activity and 13F institutional ownership, read directly from SEC EDGAR.",
    points: [
      "Insider buys and sells by value",
      "Most active names by insider volume",
      "13F institutional holders",
      "Live SEC EDGAR Form 4 feed",
    ],
    ai: "Open-market trades separated from grants and exercises.",
  },
  {
    slug: "etf-corner",
    group: "Research",
    title: "ETF Corner",
    blurb: "ETF tools for funds, holdings and performance.",
    lede: "Research ETFs like stocks — holdings, performance and flows, and which funds own the names you follow.",
    points: [
      "Fund holdings and weights",
      "Performance and flows",
      "Which ETFs hold a stock",
      "Compare funds side by side",
    ],
    ai: "See what a fund really owns before you buy it.",
  },
  {
    slug: "ai-corner",
    group: "Research",
    title: "AI Corner",
    blurb: "Every AI-related stock in one place to focus on and track.",
    lede: "The AI trade in one view — every AI-related stock, grouped and tracked so you can follow the theme without hunting for names.",
    points: [
      "All AI-related stocks in one list",
      "Grouped by segment",
      "Performance and news for each",
      "Add straight to your watchlist",
    ],
    ai: "Follow the AI theme as one position, not fifty tabs.",
  },
  {
    slug: "daily-recaps",
    group: "Market Recaps",
    title: "Daily Recaps",
    blurb: "The session summarised by What Matters Now.",
    lede: "An end-of-day recap of the session — indexes, movers, earnings and the headlines that mattered.",
    points: [
      "Index and sector wrap-up",
      "Biggest movers and why",
      "Earnings and macro highlights",
      "Delivered at the close",
    ],
    ai: "Miss the session? Read it in two minutes.",
  },
  {
    slug: "weekly-recaps",
    group: "Market Recaps",
    title: "Weekly Recaps",
    blurb: "The week's moves and what drove them.",
    lede: "The week in one read — performance, the stories behind it, and what's on deck next week.",
    points: [
      "Weekly index and sector performance",
      "The stories that drove the week",
      "Weekly gainers and losers",
      "Next week's calendar",
    ],
    ai: "The week's narrative, and what to watch next.",
  },
  {
    slug: "portfolio",
    group: "My Workspace",
    title: "Portfolio",
    blurb: "Live P/L on every holding with a daily AI summary.",
    lede: "Track your holdings with live P/L and an AI summary of what drove your portfolio today.",
    points: [
      "Live P/L on every holding",
      "Daily AI portfolio summary",
      "Leaders, laggards and drivers",
      "Earnings and events on your names",
    ],
    ai: "Your portfolio, explained — not just totalled.",
  },
  {
    slug: "watchlist",
    group: "My Workspace",
    title: "Watchlist",
    blurb: "Your tickers tracked with AI summaries.",
    lede: "Keep your names in one list with prices, news, events and an AI read on each.",
    points: [
      "Live prices and changes",
      "News and events for each name",
      "AI summary per ticker",
      "Alerts on the names you follow",
    ],
    ai: "Everything you're watching, and why it moved.",
  },
];

export const FEATURES: Feature[] = RAW;

export const FEATURE_GROUPS: FeatureGroup[] = ["Home", "Markets", "Research", "Market Recaps", "My Workspace"];

export type FeatureView = Feature & { num: string; href: string };

const pad = (n: number) => String(n).padStart(2, "0");

function computeViews(): FeatureView[] {
  let ai = 0;
  let ws = 0;
  return FEATURES.map((f) => {
    // Dashboard is the workspace grid's starting point, not an entry in it —
    // it carries no number, and workspace numbering begins at the item after it.
    if (f.group !== "AI" && f.slug === "dashboard") {
      return { ...f, num: "", href: `/features/${f.slug}` };
    }
    const num = f.group === "AI" ? pad(++ai) : pad(++ws);
    return { ...f, num, href: `/features/${f.slug}` };
  });
}

/** Every feature, numbered the way the index and detail pages badge it. */
export const FEATURE_VIEWS: FeatureView[] = computeViews();

export const AI_FEATURES: FeatureView[] = FEATURE_VIEWS.filter((f) => f.group === "AI");
export const WORKSPACE_FEATURES: FeatureView[] = FEATURE_VIEWS.filter((f) => f.group !== "AI");

export function getFeatureView(slug: string): FeatureView | undefined {
  return FEATURE_VIEWS.find((f) => f.slug === slug);
}

export function prevNextFeature(slug: string): { prev: FeatureView; next: FeatureView } | null {
  const idx = FEATURE_VIEWS.findIndex((f) => f.slug === slug);
  if (idx < 0) return null;
  const n = FEATURE_VIEWS.length;
  return {
    prev: FEATURE_VIEWS[(idx - 1 + n) % n],
    next: FEATURE_VIEWS[(idx + 1) % n],
  };
}
