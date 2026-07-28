import type { ComponentType } from "react";
import { DashThumb } from "./DashThumb";
import { MoversThumb } from "./MoversThumb";
import { StockThumb } from "./StockThumb";
import { HeatmapThumb } from "./HeatmapThumb";
import { EarningsThumb } from "./EarningsThumb";
import { AnalystThumb } from "./AnalystThumb";
import { PortfolioThumb } from "./PortfolioThumb";
import { RecapsThumb } from "./RecapsThumb";

export type Workspace = {
  n: string;
  d: string;
  long: string;
  chips: string[];
  feats: string[];
  Thumb: ComponentType;
};

export const WS_LIST: Workspace[] = [
  {
    n: "Dashboard",
    d: "Your morning brief at a glance.",
    long: "The first thing you see each morning: live indices, a What-Matters-Now AI brief, and a launchpad into every other workspace — the whole market in one screen.",
    chips: ["Indices", "What Matters Now", "AI brief"],
    feats: [
      "Live index pulse with count-up tickers and sparklines",
      "An AI 'what matters now' brief parsed from the tape",
      "Quick cards into movers, earnings and analyst flow",
      "Animated, glanceable, refreshed through the day",
    ],
    Thumb: DashThumb,
  },
  {
    n: "Market Movers",
    d: "Top winners & losers, with the why.",
    long: "The day's biggest movers ranked, each with the catalyst behind the move — filter by sector or market cap and hover any name to see why it is running.",
    chips: ["Gainers", "Losers", "Catalysts"],
    feats: [
      "Top 15 winners and losers, ranked by move",
      "Plain-English catalyst on every row",
      "Sector and market-cap filters",
      "Hover a ticker for the reason in context",
    ],
    Thumb: MoversThumb,
  },
  {
    n: "Stock Detail",
    d: "One page, the whole story.",
    long: "Everything on one name in a single view: an interactive chart with overlays, fundamentals, ratings, key levels and an AI read that explains what actually moved it.",
    chips: ["Charting", "Fundamentals", "AI read"],
    feats: [
      "Interactive chart — candles, MA/EMA, 5 chart types",
      "Fundamentals, ratings and analyst targets",
      "Key levels, peers and earnings-history trays",
      "An AI read explaining the move in plain English",
    ],
    Thumb: StockThumb,
  },
  {
    n: "Market Heatmap",
    d: "The whole market in one glance.",
    long: "A treemap of the entire market by sector and size, colored by performance — spot leadership, rotation and breadth in a single look.",
    chips: ["By sector", "By size", "Performance"],
    feats: [
      "Every sector sized by market cap",
      "Colored by performance, green to red",
      "Instantly see leadership and rotation",
      "Tap a tile to drill into the name",
    ],
    Thumb: HeatmapThumb,
  },
  {
    n: "Earnings",
    d: "Who reports, and how they have done.",
    long: "An earnings hub with a logo calendar, ten quarters of beat/miss history and graphical income statements — see the setup before the print.",
    chips: ["Calendar", "10-qtr history", "Income"],
    feats: [
      "Calendar of upcoming reports with logos",
      "10-quarter EPS beat/miss history",
      "Graphical income statements",
      "Surprise and reaction at a glance",
    ],
    Thumb: EarningsThumb,
  },
  {
    n: "Analyst Actions",
    d: "Upgrades, downgrades, targets.",
    long: "Every rating change and price-target move in one feed, with detection of clusters where five or more analysts move on the same name in a window.",
    chips: ["Ratings", "Price targets", "Clusters"],
    feats: [
      "Upgrades, downgrades and initiations",
      "From/to ratings and price-target deltas",
      "5+ action cluster detection",
      "Implied upside vs the current price",
    ],
    Thumb: AnalystThumb,
  },
  {
    n: "Portfolio Pulse",
    d: "Your book, explained.",
    long: "An AI read of your holdings — what drove the day, who led and lagged, and your P/L — with one click into the detail on any position.",
    chips: ["Drivers", "Day P/L", "AI summary"],
    feats: [
      "AI summary of what moved your book",
      "Day P/L with leaders and laggards",
      "Drill into any holding's full detail",
      "Concentration and driver breakdown",
    ],
    Thumb: PortfolioThumb,
  },
  {
    n: "Recaps",
    d: "The day, in seven cards.",
    long: "Executive end-of-day recaps you swipe through — what happened, why, technicals, fundamentals, macro and the AI verdict — read, download or schedule by email.",
    chips: ["Swipeable", "7 sections", "Schedulable"],
    feats: [
      "Seven-card swipeable briefing per name",
      "What happened → why → technical → verdict",
      "Download or schedule by email",
      "Day and week modes",
    ],
    Thumb: RecapsThumb,
  },
];
