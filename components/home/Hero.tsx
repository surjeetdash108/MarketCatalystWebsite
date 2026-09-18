import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { DashboardMock } from "./DashboardMock";
import { HeroHud } from "./HeroHud";

export function Hero() {
  return (
    <section className="mc-hero" id="mc-top">
      {/* Desktop: the product shot sits behind the copy and is revealed under a
          spotlight that tracks the cursor (see HomeMotion.tsx). */}
      <div className="mc-dash" id="mc-dash" aria-hidden="true">
        <DashboardMock />
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
              screeners, themes, IPOs, options and your own book — fourteen research workspaces, each with an AI read that
              tells you <em>what</em> moved and <em>why</em>. No reconstructing the story from ten scattered sources.{" "}
              <b>And plenty more waiting inside.</b>
            </p>
            <div className="mc-actions mc-fade" data-fade="420">
              <a className="mc-cta" href={APP_SIGNUP_URL}>
                Get me inside <i>→</i>
              </a>
            </div>
          </div>

          {/* Touch devices can't hover a spotlight, so the same shot is shown
              here as a static strip instead (CSS swaps the two). */}
          <div className="mc-shot" aria-hidden="true">
            <div className="mc-shot-frame" id="mc-shot-frame">
              <DashboardMock />
            </div>
            <div className="mc-shot-cap">
              <i />
              <span>Live terminal · 14 workspaces</span>
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
