// ============================================================
// Decorative demo data for the workspace-carousel thumbnails.
//
// Ported from MarketCatalystUI's `app/iq/data.ts`, trimmed to only the
// collections the carousel thumbnails (DashThumb, MoversThumb, StockThumb,
// HeatmapThumb, EarningsThumb, AnalystThumb, PortfolioThumb, RecapsThumb)
// actually reference. This is hardcoded/pseudo-random sample data used only
// to render fake product screenshots — it is not wired to any backend.
// ============================================================

export interface PulseItem {
  label: string;
  value: number;
  change: number;
  open: number;
  prevClose: number;
}

export interface WMNItem {
  headline: string;
  body: string;
  tag: "macro" | "earn" | "sector";
}

export interface Earning {
  ticker: string;
  name: string;
  session: string;
  marketCap: string;
  sector: string;
  epsEstimate: number | null;
  epsActual: number | null;
  revenueEstimate: number | null;
  revenueActual: number | null;
  guidanceStatus: string | null;
  priceReaction: number | null;
  tags: string[];
  owned: boolean;
  impliedMove: number | null;
}

export interface Mover {
  ticker: string;
  name: string;
  price: number;
  pctChange: number;
  rvolRatio: number;
  relativeStrength: number;
  catalystLabel: string;
  maPosture: string;
  owned: boolean;
  sector: string;
  cap: "Mega" | "Large" | "Mid" | "Small";
  weekPct: number;
  techContext: string;
  newsContext: string;
}

export interface AnalystAction {
  ticker: string;
  name: string;
  firm: string;
  actionType: "up" | "down" | "init" | "hold";
  previousRating: string;
  newRating: string;
  prevPriceTarget: number;
  newPriceTarget: number;
  priceChangeSince: number;
  actionsLast30Days: number;
  owned: boolean;
}

export interface FolioItem {
  ticker: string;
  name: string;
  price: number;
  pctChange: number;
  gainLossPct: number;
  positionSize: "Small" | "Medium" | "Large";
  conviction: "High" | "Medium" | "Low";
  eventNote: string;
}

export interface WatchItem {
  ticker: string;
  name: string;
  price: number;
  pctChange: number;
  nextEarningsDate: string;
  lastAnalystAction: string | null;
  hasOptions: boolean;
  latestHeadline: string;
}

export interface SectorRow {
  name: string;
  rank: number;
  trend: string;
  pctChange: number;
  items: [string, number, number][];
}

export interface RecapData {
  date: string;
  subtitle: string;
  headline: string;
  indices: { label: string; value: number }[];
  stories: string[];
  tomorrow: { time: string; event: string }[];
  movers: { ticker: string; reason: string; pctChange: number }[];
  internals: { label: string; value: string; direction: number }[];
}

// ---- Market Pulse ----
export const pulse: PulseItem[] = [
  { label: "S&P 500", value: 5312.08, change: 0.73, open: 5281.4, prevClose: 5273.66 },
  { label: "Nasdaq", value: 16973.17, change: 1.02, open: 16800.0, prevClose: 16801.7 },
  { label: "Dow", value: 39872.4, change: 0.41, open: 39714.0, prevClose: 39709.6 },
  { label: "Russell 2K", value: 2061.3, change: -0.32, open: 2071.4, prevClose: 2067.9 },
  { label: "VIX", value: 14.18, change: -2.51, open: 14.52, prevClose: 14.54 },
  { label: "10Y Yield", value: 4.32, change: -0.04, open: 4.36, prevClose: 4.36 },
  { label: "WTI Crude", value: 78.64, change: -1.21, open: 79.42, prevClose: 79.60 },
  { label: "Gold", value: 2344.10, change: 0.31, open: 2337.0, prevClose: 2336.8 },
  { label: "Dollar (DXY)", value: 104.21, change: 0.12, open: 104.08, prevClose: 104.09 },
];

// ---- What Matters Now ----
export const wmn: WMNItem[] = [
  { headline: "Cooler CPI print", body: 'May core inflation came in at <b>0.2% m/m</b>, below the 0.3% estimate — yields fell and rate-cut odds for September rose.', tag: "macro" },
  { headline: "NVDA earnings beat", body: '<span class="sym up">NVDA</span> beat EPS by 18% and raised FY25 guidance on Data Center demand. Stock <b class="up">+8.2%</b>.', tag: "earn" },
  { headline: "Fed minutes: higher-for-longer tone", body: "FOMC minutes reiterated patience; committee needs <b>more evidence</b> before cutting. September cut probability fell to 38%.", tag: "macro" },
  { headline: "Target misses and guides down", body: '<span class="sym down">TGT</span> Q1 EPS missed by 11%; full-year guidance cut. Consumer discretionary facing <b class="warn">margin pressure</b>.', tag: "earn" },
];

// ---- Earnings ----
export const earnings: Earning[] = [
  { ticker: "NVDA", name: "Nvidia", session: "Wed post", marketCap: "$2.91T", sector: "Semiconductors", epsEstimate: 5.56, epsActual: 6.57, revenueEstimate: 24.6, revenueActual: 26.0, guidanceStatus: "Raised", priceReaction: 8.2, tags: ["Beat", "Raised"], owned: true, impliedMove: 7.2 },
  { ticker: "MSFT", name: "Microsoft", session: "Tue post", marketCap: "$3.1T", sector: "Software", epsEstimate: 2.82, epsActual: 2.94, revenueEstimate: 60.8, revenueActual: 61.9, guidanceStatus: "In-line", priceReaction: 2.1, tags: ["Beat"], owned: true, impliedMove: 4.1 },
  { ticker: "AMZN", name: "Amazon", session: "Thu post", marketCap: "$1.9T", sector: "E-Commerce", epsEstimate: 0.98, epsActual: null, revenueEstimate: 142.6, revenueActual: null, guidanceStatus: null, priceReaction: null, tags: [], owned: false, impliedMove: 5.8 },
  { ticker: "GOOG", name: "Alphabet", session: "Mon post", marketCap: "$2.1T", sector: "Internet", epsEstimate: 1.84, epsActual: 1.89, revenueEstimate: 79.9, revenueActual: 80.5, guidanceStatus: "In-line", priceReaction: 1.3, tags: ["Beat"], owned: false, impliedMove: 3.9 },
  { ticker: "META", name: "Meta", session: "Wed post", marketCap: "$1.2T", sector: "Social Media", epsEstimate: 4.71, epsActual: 4.86, revenueEstimate: 36.2, revenueActual: 36.5, guidanceStatus: "Raised", priceReaction: 3.2, tags: ["Beat", "Raised"], owned: true, impliedMove: 5.5 },
  { ticker: "AAPL", name: "Apple", session: "Thu post", marketCap: "$3.0T", sector: "Hardware", epsEstimate: 1.50, epsActual: null, revenueEstimate: 89.3, revenueActual: null, guidanceStatus: null, priceReaction: null, tags: [], owned: true, impliedMove: 3.2 },
  { ticker: "TGT", name: "Target", session: "Wed pre", marketCap: "$58B", sector: "Retail", epsEstimate: 2.05, epsActual: 1.82, revenueEstimate: 24.5, revenueActual: 24.1, guidanceStatus: "Lowered", priceReaction: -7.8, tags: ["Miss", "Lowered"], owned: false, impliedMove: 4.6 },
  { ticker: "WMT", name: "Walmart", session: "Thu pre", marketCap: "$480B", sector: "Retail", epsEstimate: 0.52, epsActual: 0.60, revenueEstimate: 159.5, revenueActual: 161.5, guidanceStatus: "Raised", priceReaction: 5.2, tags: ["Beat", "Raised"], owned: false, impliedMove: 2.9 },
];

// ---- Market Movers ----
export const movers: Mover[] = [
  { ticker: "NVDA", name: "Nvidia", price: 1181.75, pctChange: 8.23, rvolRatio: 5.8, relativeStrength: 96, catalystLabel: "Earnings beat", maPosture: "Above 50/200", owned: true, sector: "Semis", cap: "Mega", weekPct: 18.9, techContext: "Above 50/200 · RVOL 5.8× · RS 96/99. Buyers in control — momentum positive.", newsContext: "Earnings beat is driving today's move." },
  { ticker: "ZIM", name: "ZIM Int'l", price: 18.42, pctChange: 9.97, rvolRatio: 4.2, relativeStrength: 81, catalystLabel: "Earnings beat", maPosture: "Above 50/200", owned: false, sector: "Shipping", cap: "Small", weekPct: 22.1, techContext: "Above 50/200 · RVOL 4.2× · RS 81/99. Buyers in control — momentum positive.", newsContext: "Earnings beat is driving today's move." },
  { ticker: "PLTR", name: "Palantir", price: 24.88, pctChange: 6.18, rvolRatio: 3.4, relativeStrength: 88, catalystLabel: "Guidance raise", maPosture: "Above 50/200", owned: false, sector: "Software", cap: "Large", weekPct: 14.2, techContext: "Above 50/200 · RVOL 3.4× · RS 88/99. Buyers in control — momentum positive.", newsContext: "Guidance raise is driving today's move." },
  { ticker: "AVGO", name: "Broadcom", price: 1402.50, pctChange: 2.97, rvolRatio: 1.9, relativeStrength: 77, catalystLabel: "Sympathy (semis)", maPosture: "Above 50/200", owned: false, sector: "Semis", cap: "Mega", weekPct: 7.4, techContext: "Above 50/200 · RVOL 1.9× · RS 77/99. Buyers in control — momentum positive.", newsContext: "Sympathy (semis) is driving today's move." },
  { ticker: "CRM", name: "Salesforce", price: 316.50, pctChange: 4.21, rvolRatio: 2.6, relativeStrength: 73, catalystLabel: "Analyst upgrade", maPosture: "Above 50/200", owned: false, sector: "Software", cap: "Large", weekPct: 9.6, techContext: "Above 50/200 · RVOL 2.6× · RS 73/99. Buyers in control — momentum positive.", newsContext: "Analyst upgrade is driving today's move." },
  { ticker: "DELL", name: "Dell", price: 161.80, pctChange: -3.45, rvolRatio: 3.1, relativeStrength: 42, catalystLabel: "Margin miss", maPosture: "Below 50/200", owned: false, sector: "Hardware", cap: "Large", weekPct: -6.1, techContext: "Below 50/200 · RVOL 3.1× · RS 42/99. Under distribution — momentum negative.", newsContext: "Margin miss is driving today's move." },
  { ticker: "WBA", name: "Walgreens", price: 15.30, pctChange: -5.80, rvolRatio: 2.7, relativeStrength: 18, catalystLabel: "Guidance cut", maPosture: "Below 50/200", owned: false, sector: "Retail", cap: "Mid", weekPct: -11.3, techContext: "Below 50/200 · RVOL 2.7× · RS 18/99. Under distribution — momentum negative.", newsContext: "Guidance cut is driving today's move." },
  { ticker: "INTC", name: "Intel", price: 30.12, pctChange: -1.80, rvolRatio: 1.4, relativeStrength: 24, catalystLabel: "No known catalyst", maPosture: "Below 50/200", owned: false, sector: "Semis", cap: "Large", weekPct: -4.2, techContext: "Below 50/200 · RVOL 1.4× · RS 24/99. Under distribution — momentum negative.", newsContext: "No company-specific headline — trading with its sector and the broad tape." },
];

// ---- Analyst Actions ----
export const analyst: AnalystAction[] = [
  { ticker: "CRM", name: "Salesforce", firm: "Morgan Stanley", actionType: "up", previousRating: "Equal Weight", newRating: "Overweight", prevPriceTarget: 280, newPriceTarget: 340, priceChangeSince: 3.80, actionsLast30Days: 6, owned: false },
  { ticker: "CRM", name: "Salesforce", firm: "Bernstein", actionType: "up", previousRating: "Market Perform", newRating: "Outperform", prevPriceTarget: 260, newPriceTarget: 320, priceChangeSince: 2.90, actionsLast30Days: 6, owned: false },
  { ticker: "CRM", name: "Salesforce", firm: "RBC Capital", actionType: "up", previousRating: "Sector Perform", newRating: "Outperform", prevPriceTarget: 270, newPriceTarget: 330, priceChangeSince: 3.10, actionsLast30Days: 6, owned: false },
  { ticker: "CRM", name: "Salesforce", firm: "Piper Sandler", actionType: "up", previousRating: "Neutral", newRating: "Overweight", prevPriceTarget: 265, newPriceTarget: 315, priceChangeSince: 1.80, actionsLast30Days: 6, owned: false },
  { ticker: "CRM", name: "Salesforce", firm: "Wolfe Research", actionType: "up", previousRating: "Peer Perform", newRating: "Outperform", prevPriceTarget: 275, newPriceTarget: 335, priceChangeSince: 2.50, actionsLast30Days: 6, owned: false },
  { ticker: "CRM", name: "Salesforce", firm: "Barclays", actionType: "init", previousRating: "—", newRating: "Overweight", prevPriceTarget: 0, newPriceTarget: 350, priceChangeSince: 4.20, actionsLast30Days: 6, owned: false },
  { ticker: "NVDA", name: "Nvidia", firm: "Goldman Sachs", actionType: "up", previousRating: "Buy", newRating: "Strong Buy", prevPriceTarget: 1000, newPriceTarget: 1250, priceChangeSince: 8.23, actionsLast30Days: 5, owned: true },
  { ticker: "NVDA", name: "Nvidia", firm: "JPMorgan", actionType: "up", previousRating: "Overweight", newRating: "Overweight", prevPriceTarget: 950, newPriceTarget: 1200, priceChangeSince: 5.10, actionsLast30Days: 5, owned: true },
  { ticker: "NVDA", name: "Nvidia", firm: "Wedbush", actionType: "up", previousRating: "Outperform", newRating: "Outperform", prevPriceTarget: 900, newPriceTarget: 1180, priceChangeSince: 6.40, actionsLast30Days: 5, owned: true },
  { ticker: "NVDA", name: "Nvidia", firm: "Bank of America", actionType: "up", previousRating: "Buy", newRating: "Buy", prevPriceTarget: 1050, newPriceTarget: 1300, priceChangeSince: 7.80, actionsLast30Days: 5, owned: true },
  { ticker: "NVDA", name: "Nvidia", firm: "Mizuho", actionType: "up", previousRating: "Outperform", newRating: "Outperform", prevPriceTarget: 980, newPriceTarget: 1220, priceChangeSince: 4.60, actionsLast30Days: 5, owned: true },
  { ticker: "TSLA", name: "Tesla", firm: "UBS", actionType: "up", previousRating: "Sell", newRating: "Neutral", prevPriceTarget: 120, newPriceTarget: 135, priceChangeSince: 3.45, actionsLast30Days: 2, owned: true },
  { ticker: "AAPL", name: "Apple", firm: "Morgan Stanley", actionType: "up", previousRating: "Neutral", newRating: "Buy", prevPriceTarget: 195, newPriceTarget: 215, priceChangeSince: 1.02, actionsLast30Days: 1, owned: true },
  { ticker: "AMZN", name: "Amazon", firm: "Citi", actionType: "hold", previousRating: "Buy", newRating: "Buy", prevPriceTarget: 205, newPriceTarget: 225, priceChangeSince: 2.11, actionsLast30Days: 2, owned: false },
  { ticker: "INTC", name: "Intel", firm: "Deutsche Bank", actionType: "down", previousRating: "Buy", newRating: "Neutral", prevPriceTarget: 50, newPriceTarget: 32, priceChangeSince: -2.14, actionsLast30Days: 1, owned: false },
  { ticker: "GOOG", name: "Alphabet", firm: "BofA", actionType: "hold", previousRating: "Buy", newRating: "Buy", prevPriceTarget: 195, newPriceTarget: 210, priceChangeSince: 1.30, actionsLast30Days: 2, owned: false },
  { ticker: "META", name: "Meta", firm: "Wells Fargo", actionType: "init", previousRating: "—", newRating: "Overweight", prevPriceTarget: 0, newPriceTarget: 550, priceChangeSince: 2.40, actionsLast30Days: 1, owned: true },
  { ticker: "MSFT", name: "Microsoft", firm: "Oppenheimer", actionType: "up", previousRating: "Perform", newRating: "Outperform", prevPriceTarget: 380, newPriceTarget: 450, priceChangeSince: 1.90, actionsLast30Days: 1, owned: true },
];

// ---- Portfolio ----
export const folio: FolioItem[] = [
  { ticker: "NVDA", name: "NVIDIA", price: 1181.75, pctChange: 8.23, gainLossPct: 42.60, positionSize: "Large", conviction: "High", eventNote: "Earnings beat · raised guide" },
  { ticker: "AAPL", name: "Apple", price: 189.98, pctChange: 1.02, gainLossPct: 12.40, positionSize: "Large", conviction: "High", eventNote: "Reports after close today" },
  { ticker: "TSLA", name: "Tesla", price: 171.40, pctChange: 3.45, gainLossPct: -8.10, positionSize: "Medium", conviction: "Medium", eventNote: "UBS upgrade to Neutral" },
  { ticker: "META", name: "Meta", price: 415.32, pctChange: 0.86, gainLossPct: 28.90, positionSize: "Medium", conviction: "High", eventNote: "WF initiates Overweight" },
  { ticker: "HD", name: "Home Depot", price: 342.10, pctChange: -1.10, gainLossPct: 4.20, positionSize: "Small", conviction: "Low", eventNote: "Lowered guidance" },
  { ticker: "MSFT", name: "Microsoft", price: 415.50, pctChange: 0.41, gainLossPct: 19.70, positionSize: "Large", conviction: "High", eventNote: "—" },
  { ticker: "AMZN", name: "Amazon", price: 182.20, pctChange: 2.11, gainLossPct: 30.14, positionSize: "Medium", conviction: "High", eventNote: "—" },
  { ticker: "PLTR", name: "Palantir", price: 24.88, pctChange: 6.18, gainLossPct: 55.50, positionSize: "Small", conviction: "High", eventNote: "Guidance raise" },
];

// ---- Watchlist ----
export const watch: WatchItem[] = [
  { ticker: "AMD", name: "Adv Micro Dev", price: 165.20, pctChange: -2.10, nextEarningsDate: "Jul 30", lastAnalystAction: "JPM → Neutral", hasOptions: true, latestHeadline: "Downgraded on AI-share concerns" },
  { ticker: "AVGO", name: "Broadcom", price: 1402.50, pctChange: 2.97, nextEarningsDate: "Jun 12", lastAnalystAction: null, hasOptions: true, latestHeadline: "Semis rally on NVDA read-through" },
  { ticker: "SMCI", name: "Super Micro", price: 812.40, pctChange: 5.60, nextEarningsDate: "Aug 06", lastAnalystAction: "Barclays PT $1,000", hasOptions: true, latestHeadline: "Server demand commentary lifts shares" },
  { ticker: "UBER", name: "Uber", price: 64.50, pctChange: 0.80, nextEarningsDate: "Aug 06", lastAnalystAction: "GS reiterates Buy", hasOptions: false, latestHeadline: "—" },
  { ticker: "PLTR", name: "Palantir", price: 24.88, pctChange: 6.18, nextEarningsDate: "Aug 05", lastAnalystAction: null, hasOptions: true, latestHeadline: "Guidance raise drives momentum" },
];

// ---- Sector / Heatmap ----
function _hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
const _bigCap: Record<string, number> = {
  NVDA: 2910, MSFT: 3100, AAPL: 3000, AMZN: 1900, META: 1200,
  AVGO: 612, GOOG: 2100, TSLA: 536, "BRK.B": 860, JPM: 560,
};
function _mcap(t: string): number {
  return _bigCap[t] || (12 + (_hash(t) % 270));
}

const SEC: [string, number, string[]][] = [
  ["Semiconductors", 3.1, ["NVDA", "AVGO", "TSM", "QCOM", "AMD", "TXN", "MU", "AMAT", "KLAC", "LRCX", "INTC", "ON", "MRVL", "MPWR"]],
  ["Mega-Cap Tech", 2.4, ["AAPL", "MSFT", "GOOG", "AMZN", "META", "NFLX", "ORCL", "ADBE", "CSCO", "IBM", "SAP", "INTU"]],
  ["Cloud Software", 1.8, ["CRM", "NOW", "SNOW", "DDOG", "MDB", "WDAY", "ADSK", "VEEV", "HUBS", "OKTA", "ZI", "APP", "TEAM"]],
  ["Social Media", 2.1, ["META", "SNAP", "PINS", "RDDT", "YELP", "MTCH", "ZG", "IAC", "ANGI", "BMBL", "SOFI", "HOOD"]],
  ["E-Commerce", 1.5, ["AMZN", "SHOP", "BABA", "MELI", "JD", "PDD", "EBAY", "ETSY", "W", "CHWY", "WISH", "CART"]],
  ["Cybersecurity", 0.9, ["CRWD", "PANW", "ZS", "FTNT", "S", "OKTA", "CYBR", "NET", "GEN", "TENB", "QLYS", "RPM"]],
  ["EV / Clean Energy", -1.3, ["TSLA", "BYD", "RIVN", "NIO", "LCID", "GM", "F", "PLUG", "FCEL", "BLNK", "BE", "CHPT", "NKLA"]],
  ["Consumer Disc.", 0.6, ["AMZN", "HD", "MCD", "NKE", "SBUX", "TGT", "LULU", "CMG", "LOW", "BKNG", "MAR", "HLT", "DG"]],
  ["Financials", 0.8, ["JPM", "BAC", "GS", "MS", "V", "MA", "AXP", "BRK.B", "WFC", "C", "SCHW", "BX", "KKR"]],
  ["Healthcare", 0.2, ["UNH", "JNJ", "LLY", "ABBV", "MRK", "TMO", "DHR", "PFE", "BMY", "GILD", "CVS", "CI", "HUM"]],
  ["Energy", -0.7, ["XOM", "CVX", "COP", "SLB", "EOG", "OXY", "PSX", "VLO", "MPC", "HAL", "DVN", "PXD", "BKR"]],
  ["Industrials", 0.4, ["CAT", "GE", "HON", "RTX", "UPS", "LMT", "NOC", "GD", "MMM", "EMR", "ETN", "ITW", "PH"]],
  ["Real Estate", -0.5, ["AMT", "PLD", "EQIX", "SPG", "O", "WELL", "DLR", "PSA", "VTR", "AVB", "EQR", "ARE", "WY"]],
  ["Utilities", -0.3, ["NEE", "DUK", "SO", "AEP", "EXC", "D", "PCG", "SRE", "ES", "XEL", "PEG", "ED", "WEC"]],
  ["Materials", 0.1, ["LIN", "APD", "SHW", "FCX", "NEM", "DOW", "DD", "NUE", "ALB", "MOS", "IP", "PKG", "CE"]],
  ["Consumer Staples", 0.3, ["PG", "KO", "PEP", "WMT", "COST", "PM", "MO", "CL", "GIS", "KMB", "KHC", "SYY", "MKC"]],
  ["Biotech", 1.2, ["AMGN", "BIIB", "REGN", "VRTX", "MRNA", "GILD", "ILMN", "ALNY", "EXAS", "SGEN", "SAGE", "SRPT"]],
  ["Med Devices", 0.5, ["MDT", "ABT", "ISRG", "BSX", "SYK", "EW", "ZBH", "BDX", "IQV", "TMO", "RMD", "HOLX"]],
  ["Insurance", 0.6, ["CB", "MET", "AIG", "PRU", "AFL", "TRV", "ALL", "MKL", "HIG", "LNC", "GL", "EQH"]],
  ["Banks", 0.9, ["JPM", "BAC", "WFC", "C", "USB", "PNC", "TFC", "FITB", "KEY", "RF", "HBAN", "CFG", "MTB"]],
  ["Autos", -0.8, ["TSLA", "TM", "GM", "F", "STLA", "HMC", "RIVN", "NIO", "LCID", "RACE", "BWM", "VWAGY"]],
];

export const sectorList: SectorRow[] = SEC.map((row, i) => {
  const [name, pctChange, tk] = row;
  return {
    name,
    rank: i + 1,
    trend: pctChange > 0.5 ? "Improving" : pctChange < -0.5 ? "Deteriorating" : "Flat",
    pctChange,
    items: tk.map(
      (t) => [t, _mcap(t), +(pctChange + (((_hash(t + name) % 9) - 4) * 0.35)).toFixed(2)] as [string, number, number]
    ),
  };
});

// ---- End-of-Day Recap ----
export const recap: RecapData = {
  date: "Tuesday, May 21",
  subtitle: "auto-generated 4:31 ET",
  headline: "Markets closed broadly higher on cooler inflation",
  indices: [
    { label: "S&P 500", value: 0.73 },
    { label: "Nasdaq", value: 1.02 },
    { label: "Dow", value: 0.41 },
    { label: "Russell 2K", value: -0.32 },
  ],
  stories: [
    "Cooler-than-expected CPI lifted rate-cut hopes and sent yields lower.",
    "NVDA's beat-and-raise powered a 3.1% rally in semiconductors.",
    "Defensive sectors lagged as risk appetite returned across the tape.",
  ],
  tomorrow: [
    { time: "8:30a", event: "Initial jobless claims" },
    { time: "BMO", event: "Earnings: DELL, HD" },
    { time: "2:00p", event: "FOMC minutes" },
    { time: "AMC", event: "Earnings: SNOW, WDAY" },
  ],
  movers: [
    { ticker: "NVDA", reason: "Earnings beat", pctChange: 8.23 },
    { ticker: "ZIM", reason: "Earnings beat", pctChange: 9.97 },
    { ticker: "PLTR", reason: "Guidance raise", pctChange: 6.18 },
    { ticker: "DELL", reason: "Margin miss", pctChange: -3.45 },
    { ticker: "WBA", reason: "Guidance cut", pctChange: -5.80 },
  ],
  internals: [
    { label: "Advancers / Decliners", value: "2,810 / 1,140", direction: 1 },
    { label: "New 52-wk highs", value: "184", direction: 1 },
    { label: "New 52-wk lows", value: "39", direction: -1 },
    { label: "Up volume", value: "71%", direction: 1 },
  ],
};
