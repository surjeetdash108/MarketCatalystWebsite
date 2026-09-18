// ============================================================
// PRODUCT SHOT CONTENT (the 1440x900 terminal mock)
// ============================================================
// Rendered twice: under the hero's cursor spotlight on desktop,
// and as a static scroll-revealed strip on touch devices.
// Colours are token names only — see app/theme.css.

import type { Tone } from "./data";

export const dashNav: { t: string; active?: boolean }[] = [
  { t: "Dashboard", active: true },
  { t: "Earnings Hub" },
  { t: "Movers" },
  { t: "Market Heatmap" },
  { t: "Analyst Actions" },
  { t: "Screener" },
  { t: "Themes" },
  { t: "IPO Corner" },
  { t: "Options" },
  { t: "Insider & Institutional" },
  { t: "Commentary" },
  { t: "Portfolio Pulse" },
  { t: "Watchlist" },
];

export const dashTicker: { k: string; v: string; chg: string; tone: Tone }[] = [
  { k: "Dow", v: "52,093.11", chg: "▼ 0.63%", tone: "down" },
  { k: "Russell 2K", v: "2,892.24", chg: "▼ 0.40%", tone: "down" },
  { k: "VIX", v: "17.82", chg: "▲ 4.21%", tone: "up" },
  { k: "30Y Yield", v: "5.36", chg: "▲ 0.66%", tone: "up" },
  { k: "NYSE Comp", v: "24,205.39", chg: "▼ 0.52%", tone: "down" },
  { k: "FTSE 100", v: "10,607.95", chg: "▼ 0.84%", tone: "down" },
  { k: "Nikkei 225", v: "63,484.10", chg: "▼ 0.01%", tone: "down" },
  { k: "S&P 500", v: "7,585.73", chg: "▼ 0.45%", tone: "down" },
  { k: "Nasdaq", v: "25,981.57", chg: "▼ 0.78%", tone: "down" },
];

export const dashIdx: { k: string; v: string; chg: string; tone: Tone; hero?: boolean }[] = [
  { k: "S&P 500", v: "7,585.73", chg: "▼ −0.45%", tone: "down", hero: true },
  { k: "NASDAQ", v: "25,981.57", chg: "▼ −0.78%", tone: "down" },
  { k: "DOW", v: "52,093.11", chg: "▼ −0.63%", tone: "down" },
  { k: "RUSSELL 2K", v: "2,892.24", chg: "▼ −0.40%", tone: "down" },
  { k: "VIX", v: "17.82", chg: "▲ +4.21%", tone: "up" },
  { k: "30Y YIELD", v: "5.36", chg: "▲ +0.66%", tone: "up" },
];

export const dashNews: { h: string; b: string }[] = [
  { h: "Cooler CPI print.", b: "Core inflation came in at 0.2% m/m, below the 0.3% estimate — yields fell and rate-cut odds rose." },
  { h: "NVDA earnings beat.", b: "Beat EPS by 18% and raised guidance on Data Center demand." },
  { h: "Fed minutes: higher-for-longer tone.", b: "Minutes reiterated patience; September cut probability fell to 38%." },
  { h: "Target misses and guides down.", b: "Q1 EPS missed by 11%; full-year guidance cut on margin pressure." },
  { h: "Oil slides on demand concerns.", b: "Brent fell below $80 as compliance data disappointed. Energy −1.8%." },
];

/** `tile` indexes the --mc-tile-N gradients in app/theme.css. */
export const dashEarn: { sym: string; when: string; chg: string; tone: Tone; tile: number }[] = [
  { sym: "NVDA", when: "Wed post", chg: "+8.20%", tone: "up", tile: 1 },
  { sym: "MSFT", when: "Tue post", chg: "+2.10%", tone: "up", tile: 2 },
  { sym: "AMZN", when: "Thu post", chg: "pending", tone: "muted", tile: 3 },
  { sym: "GOOG", when: "Mon post", chg: "+1.30%", tone: "up", tile: 4 },
  { sym: "META", when: "Wed post", chg: "+3.20%", tone: "up", tile: 5 },
];

export const dashMovers: { sym: string; note: string; chg: string; tile: number }[] = [
  { sym: "ZYBT", note: "No known catalyst", chg: "+1047.56%", tile: 6 },
  { sym: "GORO", note: "No known catalyst", chg: "+229.82%", tile: 7 },
  { sym: "ADVB", note: "No known catalyst", chg: "+76.94%", tile: 8 },
  { sym: "IREG", note: "No known catalyst", chg: "+39.85%", tile: 3 },
  { sym: "IRE", note: "No known catalyst", chg: "+39.33%", tile: 9 },
];

/** `heat` indexes the --mc-heat-up-N / --mc-heat-dn-N ramp in app/theme.css. */
export const dashHeat: { k: string; v: string; heat: string }[] = [
  { k: "Semis", v: "+3.10%", heat: "up-1" },
  { k: "NVDA", v: "+0.23%", heat: "up-4" },
  { k: "TSM", v: "−2.77%", heat: "dn-1" },
  { k: "AVGO", v: "−0.97%", heat: "dn-6" },
  { k: "Mega-Cap", v: "+2.40%", heat: "up-2" },
  { k: "AAPL", v: "+0.14%", heat: "up-6" },
  { k: "GOOG", v: "−2.17%", heat: "dn-3" },
  { k: "MSFT", v: "+2.15%", heat: "up-3" },
  { k: "EV/Clean", v: "−1.30%", heat: "dn-5" },
  { k: "TSLA", v: "−2.61%", heat: "dn-2" },
  { k: "MU", v: "+1.94%", heat: "up-4" },
  { k: "AMD", v: "−1.03%", heat: "dn-6" },
  { k: "Financials", v: "+0.80%", heat: "up-5" },
  { k: "JPM", v: "−0.60%", heat: "dn-7" },
  { k: "BRK.", v: "+0.45%", heat: "up-7" },
  { k: "V", v: "−1.80%", heat: "dn-4" },
];
