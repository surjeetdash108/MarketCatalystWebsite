import Link from "next/link";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { plans, stats } from "./data";
import { workspaces } from "./workspaces";
import { WorkspacePanel } from "./WorkspacePanel";

// ── Stacked workspace panels ────────────────────────────────
export function WorkspaceStack() {
  const total = String(workspaces.length).padStart(2, "0");

  return (
    <section className="mc-stack" id="workspaces">
      <div className="mc-stack-head">
        <div>
          <div className="mc-kicker">16 workspaces · stacked</div>
          <h2 className="mc-h2">
            Every view, <span className="mc-serif">stacked</span> in one scroll
          </h2>
          <p className="mc-section-note">
            Eight of the app&apos;s screens below, with their real tabs and columns — plus the dashboard, live feed, heatmap,
            themes, stock search, recaps and watchlist waiting inside. Figures are blurred samples.
          </p>
        </div>
        <div className="mc-stack-meta">
          <div className="mc-stack-idx" id="mc-stack-idx">
            01 / {total}
          </div>
          <div className="mc-stack-badge">{workspaces.length} of 16 shown · {16 - workspaces.length} more inside</div>
        </div>
      </div>

      {workspaces.map((w) => (
        <WorkspacePanel key={w.num} w={w} />
      ))}
    </section>
  );
}

// ── Coverage stats ──────────────────────────────────────────
export function Coverage() {
  return (
    <section className="mc-coverage" id="mc-coverage">
      <div className="mc-spot" id="mc-spot" aria-hidden="true" />
      <div className="mc-inner">
        <div className="mc-head-row">
          <div>
            <div className="mc-kicker">Coverage</div>
            <h2 className="mc-h2">
              Why it moved, earnings, analysts — <span className="mc-serif">all in one place</span>
            </h2>
          </div>
          <div className="mc-head-note">One normalised record · every view attributed</div>
        </div>

        <div className="mc-stats">
          {stats.map((s) => (
            <div className="mc-stat" key={s.label}>
              <div className="mc-stat-v">
                <b data-count={s.value}>0</b>
                <span>{s.suffix}</span>
              </div>
              <div className="mc-stat-l">{s.label}</div>
              <div className="mc-stat-n">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ─────────────────────────────────────────────────
export function PricingPlans() {
  return (
    <section className="mc-pricing" id="pricing">
      <div className="mc-inner">
        <div className="mc-head-row">
          <div>
            <div className="mc-kicker">Pricing</div>
            <h2 className="mc-h2">
              One platform. <span className="mc-serif">Simple plans.</span>
            </h2>
          </div>
          <div className="mc-head-note">Cancel anytime, no questions asked</div>
        </div>

        <div className="mc-plans">
          {plans.map((p) => (
            <div className={`mc-plan${p.popular ? " is-hot" : ""}`} key={p.name}>
              <div className="mc-plan-top">
                <span className="mc-plan-name">{p.name}</span>
                {p.popular ? <span className="mc-plan-flag">Most popular</span> : null}
              </div>
              <div className="mc-plan-price">
                <b>{p.price}</b>
                <span>/mo</span>
              </div>
              <p className="mc-plan-blurb">{p.blurb}</p>
              <div className="mc-plan-feats">
                {p.features.map((f) => (
                  <div className="mc-plan-feat" key={f}>
                    <i>✓</i>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
              <a className={`mc-plan-cta${p.popular ? " is-solid" : ""}`} href={APP_SIGNUP_URL}>
                {p.cta}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Closing CTA ─────────────────────────────────────────────
export function FinalCta() {
  return (
    <section className="mc-final">
      <h2 className="mc-fade" data-fade="0">
        Start your research in
        <br />
        <span className="mc-serif">one place</span>
      </h2>
      <div className="mc-final-actions mc-fade" data-fade="220">
        <a className="mc-cta mc-cta-lg" href={APP_SIGNUP_URL}>
          Get me inside <i>→</i>
        </a>
        <Link className="mc-cta-ghost" href="/contact">
          Talk to us
        </Link>
      </div>
      <div className="mc-final-fine">
        MarketCatalyst is a market research platform for informational purposes — not investment advice.
      </div>
    </section>
  );
}
