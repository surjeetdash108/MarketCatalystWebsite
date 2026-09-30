import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import type { LiveTape } from "@/lib/market/tape-types";
import { HeroHud } from "./HeroHud";

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
          {/* Mobile viewports: phones load 640w or 750w WebP (~27-35KB instead of 85KB) */}
          <source
            media="(max-width: 768px)"
            type="image/webp"
            srcSet="/hero-desk-640.webp 640w, /hero-desk-750.webp 750w"
            sizes="100vw"
          />
          {/* Desktop viewports */}
          <source
            media="(min-width: 769px)"
            type="image/webp"
            srcSet="/hero-desk-1280.webp 1280w, /hero-desk-1920.webp 1920w, /hero-desk-2560.webp 2560w"
            sizes="max(100vw, 150vh)"
          />
          {/* Described rather than decorative: it is the product shot, and the
              alt text is how search engines and screen readers know what it
              shows. It is the largest paint in the hero, hence the high fetch
              priority. */}
          <img
            src="/hero-desk-640.webp"
            alt="MarketCatalyst dashboard showing market data"
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </div>
      <div className="mc-veil" id="mc-veil" aria-hidden="true" />

      <div className="mc-hero-grid">
        <div className="mc-hero-left">
          {/* Two lines, and exactly two: each masked span is its own block, so
              the break falls at the comma by construction rather than wherever
              the measure happens to run out. The type is sized in the CSS so
              the longer of the two never wraps again.

              The small label leads the same heading so the H1 says what the
              site is, not only the slogan: search engines read it as "AI
              Stock Market Research Platform - Every market view, revealed
              inside." */}
          <h1 className="mc-h1">
            <span className="mc-h1-kicker">
              <i aria-hidden="true" />
              AI Stock Market Research Platform
            </span>
            <span>Every market view,</span>
            <span>
              revealed <em className="mc-serif">inside</em>.
            </span>
          </h1>

          <div className="mc-hero-row">
            <p className="mc-lede" style={{ maxWidth: "1100px" }}>
              <b>The entire market, narrated.</b> Keep your pulse on the tape with{" "}
              <em className="mc-serif">Live Heatmaps</em>, breaking news feeds, and real-time sector performance. Plan your week using comprehensive Earnings, Economic, and IPO calendars.
              <br /><br />

              Cut through the noise with Daily and Weekly recaps, powered by our{" "}
              <em className="mc-serif">&lsquo;What Matters Now&rsquo; AI synthesis</em>. Dive deeper into any ticker with 13F filings, insider flows, earnings transcripts, and historical reaction overlays.
              <br /><br />

              Build your edge with advanced screeners, ETF tools, and dynamic watchlists. No scattered sources—everything is seamlessly integrated into one platform.
              <b> And plenty more waiting <em className="mc-serif">inside.</em></b>
            </p>
            <div className="mc-actions">
              <a className="mc-cta" href={APP_SIGNUP_URL}>
                Get me inside <i>→</i>
              </a>
            </div>
          </div>
        </div>

        <div className="mc-hud-wrap">
          <HeroHud initial={tape} />

          <div className="mc-cue">
            <i />
            <span>Scroll to read the market</span>
          </div>
        </div>
      </div>
    </section>
  );
}
