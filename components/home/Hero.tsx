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
          the same job in CSS at every viewport. Served AVIF first and WebP
          second, with the JPEG as the floor - 106KB / 190KB / 379KB at full
          width against a 25MB original, which nothing under a 1px blur can
          tell apart. */}
      <div className="mc-dash" id="mc-dash">
        <picture>
          {/* `sizes` is the width `object-fit: cover` renders the 3:2 shot
              at: the full width, or 1.5x the height on a tall screen. */}
          <source
            type="image/avif"
            srcSet="/hero-desk-1280.avif 1280w, /hero-desk-1920.avif 1920w, /hero-desk-2560.avif 2560w"
            sizes="max(100vw, 150vh)"
          />
          <source
            type="image/webp"
            srcSet="/hero-desk-1280.webp 1280w, /hero-desk-1920.webp 1920w, /hero-desk-2560.webp 2560w"
            sizes="max(100vw, 150vh)"
          />
          {/* Described rather than decorative: it is the product shot, and the
              alt text is how search engines and screen readers know what it
              shows. It is the largest paint in the hero, hence the high fetch
              priority. */}
          <img
            src="/hero-desk.jpg"
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
              inside." It fades in with the lede rather than masking in. */}
          <h1 className="mc-h1">
            <span className="mc-h1-kicker mc-fade" data-fade="0">
              <i aria-hidden="true" />
              AI Stock Market Research Platform
            </span>
            <span>
              <span className="mc-mask" data-mask="0">
                Every market view,
              </span>
            </span>
            <span>
              <span className="mc-mask" data-mask="110">
                revealed <em className="mc-serif">inside</em>.
              </span>
            </span>
          </h1>

          <div className="mc-hero-row">
            <p className="mc-lede mc-fade"data-fade="320"style={{ maxWidth: "1100px" }}>
              <b>The entire market, narrated.</b> Keep your pulse on the tape with{" "}
              <em className="mc-serif">Live Heatmaps</em>, breaking news feeds, and real-time sector performance. Plan your week using comprehensive Earnings, Economic, and IPO calendars.
              <br /><br />

              Cut through the noise with Daily and Weekly recaps, powered by our{" "}
              <em className="mc-serif">'What Matters Now' AI synthesis</em>. Dive deeper into any ticker with 13F filings, insider flows, earnings transcripts, and historical reaction overlays.
              <br /><br />

              Build your edge with advanced screeners, ETF tools, and dynamic watchlists. No scattered sources—everything is seamlessly integrated into one platform.
              <b> And plenty more waiting <em className="mc-serif">inside.</em></b>
            </p>
            <div className="mc-actions mc-fade" data-fade="420">
              <a className="mc-cta" href={APP_SIGNUP_URL}>
                Get me inside <i>→</i>
              </a>
            </div>
          </div>
        </div>

        <div className="mc-hud-wrap mc-fade" data-fade="520">
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
