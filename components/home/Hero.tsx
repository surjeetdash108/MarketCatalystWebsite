import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { HeroHud } from "./HeroHud";

export function Hero() {
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
          second, with the JPEG as the floor - 149KB / 234KB / 369KB against a
          25MB original, which nothing under a 1px blur can tell apart. */}
      <div className="mc-dash" id="mc-dash" aria-hidden="true">
        <picture>
          <source srcSet="/hero-desk.avif" type="image/avif" />
          <source srcSet="/hero-desk.webp" type="image/webp" />
          {/* Decorative, and the parent is aria-hidden - so no alt text. It is
              the largest paint in the hero, hence the high fetch priority. */}
          <img src="/hero-desk.jpg" alt="" fetchPriority="high" decoding="async" />
        </picture>
      </div>
      <div className="mc-veil" id="mc-veil" aria-hidden="true" />

      <div className="mc-hero-grid">
        <div className="mc-hero-left">
          {/* Two lines, and exactly two: each masked span is its own block, so
              the break falls at the comma by construction rather than wherever
              the measure happens to run out. The type is sized in the CSS so
              the longer of the two never wraps again. */}
          <h1 className="mc-h1">
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
            <p className="mc-lede mc-fade" data-fade="320">
              The entire market, narrated. Movers, earnings, analyst actions, insider and institutional flows, heatmaps,
              screeners, themes, IPOs, options and your own book — fourteen research workspaces, each with an{" "}
              <em className="mc-serif">AI read</em> that tells you <em className="mc-serif">what</em> moved and{" "}
              <em className="mc-serif">why</em>. No reconstructing the story from ten scattered sources.{" "}
              <b>And plenty more waiting inside.</b>
            </p>
            <div className="mc-actions mc-fade" data-fade="420">
              <a className="mc-cta" href={APP_SIGNUP_URL}>
                Get me inside <i>→</i>
              </a>
            </div>
          </div>
        </div>

        <div className="mc-hud-wrap mc-fade" data-fade="520">
          <HeroHud />

          <div className="mc-cue">
            <i />
            <span>Scroll to read the market</span>
          </div>
        </div>
      </div>
    </section>
  );
}
