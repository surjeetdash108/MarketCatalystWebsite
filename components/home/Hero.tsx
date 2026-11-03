import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import type { LiveTape } from "@/lib/market/tape-types";
// import { HeroHud } from "./HeroHud";

const MODULES: { name: string; line: string }[] = [
  {
    name: "Market Catalyst",
    line: "Your intelligent market companion, turning moves, news and trends into actionable insights — live feed, movers and heatmaps, earnings hub and calendar, analyst actions, 13F and insider moves, IPOs, ETFs, AI companies, screener and recaps, plus your own portfolio and watchlist.",
  },
  {
    name: "Stock Intelligence",
    line: "See why any stock moved and why it could move next, scored on business, earnings, valuation, technicals, flows and macro. Build short-, medium- and long-term theses and monitor them live, with invalidations flagged as they happen.",
  },
  {
    name: "Strategy Lab",
    line: "Start from curated strategies or build and save your own. Backtest and refine them on data-driven insights and market signals, and know the confluences right before you take the trade.",
  },
  {
    name: "Money Flow",
    line: "Track institutional and market money movement at a glance, spot bullish and bearish opportunities, and confirm them with multiple chart validations specially curated for intraday and swing trades.",
  },
];

// `tape` feeds the hidden tape snapshot below; kept so page.tsx is unchanged.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Hero({ tape }: { tape: LiveTape | null }) {
  return (
    <section className="mc-hero" id="mc-top">
      {/* The product shot behind the copy, revealed under a spotlight that
          follows the cursor on a laptop and the finger on a touch screen
          (see HomeMotion.tsx). It used to be duplicated below as a static
          framed strip on touch devices, which read as a screenshot pasted
          into the page rather than as the hero's own backdrop.

          A photograph rather than the DOM mock it replaced: the mock had to be
          transform-fitted to the stage by JS, where `object-fit: cover` does
          the same job in CSS at every viewport. Served WebP first, with the
          JPEG as the floor - 190KB / 379KB at full width against a 25MB original,
          which nothing under a 1px blur can tell apart. */}
      <div className="mc-dash" id="mc-dash">
        <picture>
          {/* Mobile viewports: phones load 480w, 640w or 750w AVIF / WebP (~8-17KB) */}
          <source
            media="(max-width: 768px)"
            type="image/avif"
            srcSet="/hero-desk-480.avif 480w, /hero-desk-640.avif 640w, /hero-desk-750.avif 750w"
            sizes="100vw"
          />
          <source
            media="(max-width: 768px)"
            type="image/webp"
            srcSet="/hero-desk-480.webp 480w, /hero-desk-640.webp 640w, /hero-desk-750.webp 750w"
            sizes="100vw"
          />
          {/* Desktop viewports */}
          <source
            media="(min-width: 769px)"
            type="image/avif"
            srcSet="/hero-desk-1280.avif 1280w, /hero-desk-1920.avif 1920w, /hero-desk-2560.avif 2560w"
            sizes="max(100vw, 150vh)"
          />
          <source
            media="(min-width: 769px)"
            type="image/webp"
            srcSet="/hero-desk-1280.webp 1280w, /hero-desk-1920.webp 1920w, /hero-desk-2560.webp 2560w"
            sizes="max(100vw, 150vh)"
          />
          {/* Backing image has opacity: 0 and is revealed on touch/hover spotlight.
              Low fetch priority & lazy loading ensure critical fonts and LCP copy render first. */}
          <img
            src="/hero-desk-480.webp"
            alt="MarketCatalyst dashboard showing market data"
            fetchPriority="low"
            decoding="async"
            loading="lazy"
          />
        </picture>
      </div>
      <div className="mc-veil" id="mc-veil" aria-hidden="true" />

      <div className="mc-hero-center">
        {/* Two lines, each its own block so the break falls before "Trade"
            by construction; on a phone the first line wraps once more. It
            follows the module cards below: find the edge (Market Catalyst,
            Stock Intelligence, Money Flow), validate it (backtests, confluence,
            invalidations), then trade. */}
        <h1 className="mc-h1">
          {/* Kicker hidden for now. To bring it back, restore:
          <span className="mc-h1-kicker">
            <i aria-hidden="true" />
            AI Stock Market Research Platform
          </span> */}
          <span>Find the edge. Validate it.</span>
          <span>
            Trade with <em className="mc-serif">conviction</em>.
          </span>
        </h1>

        <p className="mc-lede">
          We listened to traders and built what they asked for: market research,
          AI&nbsp;confluence and strategy backtesting before taking any trade&nbsp;&mdash; all
          in one place.
        </p>

        <div className="mc-actions">
          <a className="mc-cta" href={APP_SIGNUP_URL}>
            Get me inside <i>→</i>
          </a>
          <a className="mc-cta-ghost" href="#workspaces">
            See the workspaces
          </a>
        </div>

        {/* The app's four modules, named and ordered as in its top switcher
            (MarketCatalystUI app/iq/module-switcher.tsx). The first is the
            data-rich default; the other three are the AI/ML engines. */}
        <ul className="mc-mods" aria-label="Inside MarketCatalyst">
          {MODULES.map((m) => (
            <li className={`mc-mod${m.name === "Market Catalyst" ? " is-data" : " is-ai"}`} key={m.name}>
              <b className="mc-mod-name">{m.name}</b>
              <p className="mc-mod-line">{m.line}</p>
            </li>
          ))}
        </ul>

        {/* Tape snapshot hidden for now. To bring it back, restore this block
            and the HeroHud import above:
        <div className="mc-hud-wrap">
          <HeroHud initial={tape} />
        </div> */}
      </div>
    </section>
  );
}
