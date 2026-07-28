import { APP_SIGNUP_URL } from "./app-url";

export function Pricing() {
  return (
    <section className="mq-pricing" id="pricing">
      <div className="mq-kicker" style={{ textAlign: "center" }}>
        Pricing
      </div>
      <h2 className="mqp-title">One terminal. Simple plans.</h2>
      <div className="mqp-grid">
        <div className="mqp-card">
          <div className="mqp-tier">Starter</div>
          <div className="mqp-price">
            $0<span>/mo</span>
          </div>
          <p className="mqp-d">Explore the whole terminal with delayed data.</p>
          <ul className="mqp-feat">
            <li>All 14 workspaces</li>
            <li>Delayed market data</li>
            <li>Daily EOD recap</li>
          </ul>
          <a className="mqp-btn" href={APP_SIGNUP_URL}>
            Start free
          </a>
        </div>
        <div className="mqp-card hot">
          <div className="mqp-flag">Most popular</div>
          <div className="mqp-tier">Pro</div>
          <div className="mqp-price">
            $29<span>/mo</span>
          </div>
          <p className="mqp-d">Real-time research for active investors.</p>
          <ul className="mqp-feat">
            <li>Real-time data &amp; alerts</li>
            <li>AI read in every view</li>
            <li>Portfolio &amp; watchlist AI</li>
            <li>Scheduled recaps</li>
          </ul>
          <a className="mqp-btn solid" href={APP_SIGNUP_URL}>
            Go Pro
          </a>
        </div>
        <div className="mqp-card">
          <div className="mqp-tier">Elite</div>
          <div className="mqp-price">
            $79<span>/mo</span>
          </div>
          <p className="mqp-d">Maximum firepower for serious investors.</p>
          <ul className="mqp-feat">
            <li>Everything in Pro</li>
            <li>Multi-portfolio &amp; 13F tracking</li>
            <li>Custom alert rules</li>
            <li>API &amp; data export</li>
            <li>Priority support</li>
          </ul>
          <a className="mqp-btn" href={APP_SIGNUP_URL}>
            Go Elite
          </a>
        </div>
      </div>
    </section>
  );
}
