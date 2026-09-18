import { tone } from "./data";
import { dashEarn, dashHeat, dashIdx, dashMovers, dashNav, dashNews, dashTicker } from "./dashboard-data";

// The terminal screenshot, drawn in DOM rather than shipped as an image so it
// stays crisp at any scale, inherits the theme tokens, and costs no bytes.
// Fixed 1440x900 with transform-origin: top left — HomeMotion.tsx measures the
// container and scales it to fit (hero spotlight on desktop, static strip on
// touch devices).
export function DashboardMock() {
  return (
    <div className="mcd">
      <div className="mcd-rail">
        <div className="mcd-brand">
          <i />
          <span>MarketCatalyst</span>
        </div>
        {dashNav.map((n) => (
          <div key={n.t} className={`mcd-nav${n.active ? " is-active" : ""}`}>
            <i />
            {n.t}
          </div>
        ))}
      </div>

      <div className="mcd-main">
        <div className="mcd-ticker">
          {dashTicker.map((q) => (
            <span key={q.k}>
              <em>{q.k}</em>
              <b>{q.v}</b>
              <em style={{ color: tone(q.tone) }}>{q.chg}</em>
            </span>
          ))}
        </div>

        <div className="mcd-idx">
          {dashIdx.map((ix) => (
            <div key={ix.k} className={`mcd-idx-cell${ix.hero ? " is-hero" : ""}`}>
              <div className="mcd-idx-k">{ix.k}</div>
              <div className="mcd-idx-v">{ix.v}</div>
              <div className="mcd-idx-c" style={{ color: tone(ix.tone) }}>
                {ix.chg}
              </div>
            </div>
          ))}
        </div>

        <div className="mcd-news">
          <div className="mcd-news-head">
            <i />
            <b>What Matters Now</b>
            <span className="mcd-news-live">● Live</span>
            <span className="mcd-news-meta">AI-curated · updates every 90s</span>
            <span className="mcd-news-badge">+ 30-sec audio</span>
          </div>
          <div className="mcd-news-list">
            {dashNews.map((n) => (
              <div key={n.h} className="mcd-news-item">
                <i>◪</i>
                <span>
                  <b>{n.h}</b> {n.b}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mcd-cards">
          <div className="mcd-card">
            <div className="mcd-card-head">
              <span style={{ color: "var(--mc-text)", fontFamily: "inherit", fontSize: "11px", fontWeight: 600 }}>
                Earnings Today
              </span>
              <span>View all →</span>
            </div>
            {dashEarn.map((e) => (
              <div key={e.sym} className="mcd-row">
                <span className="mcd-avatar" style={{ background: `var(--mc-tile-${e.tile})` }} />
                <span className="mcd-sym">{e.sym}</span>
                <span className="mcd-when">{e.when}</span>
                <span className="mcd-chg" style={{ color: tone(e.tone) }}>
                  {e.chg}
                </span>
              </div>
            ))}
          </div>

          <div className="mcd-card">
            <div className="mcd-card-head">
              <span style={{ color: "var(--mc-text)", fontFamily: "inherit", fontSize: "11px", fontWeight: 600 }}>Movers</span>
              <span>View all →</span>
            </div>
            <div className="mcd-tabs">
              <span className="is-active">Gainers</span>
              <span>Losers</span>
              <span>Most Active</span>
            </div>
            {dashMovers.map((m) => (
              <div key={m.sym} className="mcd-row">
                <span className="mcd-avatar" style={{ background: `var(--mc-tile-${m.tile})` }} />
                <span className="mcd-sym">{m.sym}</span>
                <span className="mcd-note">{m.note}</span>
                <span className="mcd-chg" style={{ color: tone("up") }}>
                  {m.chg}
                </span>
              </div>
            ))}
          </div>

          <div className="mcd-card">
            <div className="mcd-card-head">
              <span style={{ color: "var(--mc-text)", fontFamily: "inherit", fontSize: "11px", fontWeight: 600 }}>
                Market Heatmap
              </span>
              <span>Full map →</span>
            </div>
            <div className="mcd-heat">
              {dashHeat.map((t, i) => (
                <div key={`${t.k}-${i}`} className="mcd-heat-cell" style={{ background: `var(--mc-heat-${t.heat})` }}>
                  <b>{t.k}</b>
                  <span>{t.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
