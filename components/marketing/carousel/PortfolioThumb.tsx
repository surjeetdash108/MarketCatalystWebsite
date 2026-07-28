import { ScaledScreen } from "./ScaledScreen";
import { Spark } from "./Spark";
import { StockDetailContent } from "./StockDetailContent";
import { folio } from "./data";
import { fmt, sign, cls } from "./utils";

export function PortfolioThumb() {
  const dayPL = folio.reduce((s, f) => s + f.pctChange * f.price * 0.005, 0);
  const tot = 128430;
  return (
    <ScaledScreen>
      <div className="page-head" style={{ padding: "28px 40px 20px" }}>
        <div>
          <div className="eyebrow">Portfolio Pulse</div>
          <h1 className="page-title">Portfolio Pulse</h1>
          <div className="page-sub">
            {folio.length} holdings &middot; ${tot.toLocaleString()} &middot; <span className="up">+${Math.round(dayPL).toLocaleString()} today</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M4 16l5-5 4 4 3-3 4 4" />
              <circle cx="8.5" cy="8.5" r="1.5" />
            </svg>{" "}
            Import from photo
          </button>
          <button className="btn primary">
            <svg viewBox="0 0 24 24" fill="none" style={{ width: 15, height: 15 }}>
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>{" "}
            Add holding
          </button>
        </div>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div className="ai-block" style={{ marginBottom: 14 }}>
          <div className="card-h">
            <h3 className="ai-c">&#9670; AI portfolio summary</h3>
            <span className="pill ai">drivers &middot; leaders &middot; laggards</span>
          </div>
          <div className="card-b">
            <ul className="wmn-body" style={{ columns: 2 }}>
              <li>
                <span className="bullet" />
                <span>
                  <b>Biggest driver:</b> <b style={{ color: "var(--text-hi)" }}>NVDA</b> — +8.23% at 28% weight.
                </span>
              </li>
              <li>
                <span className="bullet" />
                <span>
                  <b>Leader:</b> <b className="up">NVDA +8.23%</b>; <b>laggard:</b> <b className="down">HD -1.10%</b>.
                </span>
              </li>
              <li>
                <span className="bullet" />
                <span>
                  <b>Net:</b> {folio.filter((h) => h.pctChange > 0).length} of {folio.length} green today.
                </span>
              </li>
              <li>
                <span className="bullet" />
                <span>Click any holding on the left to open its full detail →</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="pf-master">
          <div className="pf-side">
            <div className="card">
              <div className="card-h">
                <h3>Holdings</h3>
                <span style={{ fontSize: ".72rem", color: "var(--text-dim-solid)" }}>{folio.length} names</span>
              </div>
              <div className="pf-list">
                {folio.map((f, i) => (
                  <div key={f.ticker} className={`pf-li${i === 0 ? " active" : ""}`}>
                    <div><span className="s">{f.ticker}</span><span className="n">{f.name}</span></div>
                    <div className="pf-spark"><Spark idx={i + 3} up={f.pctChange >= 0} /></div>
                    <div><span className="px">${fmt(f.price, 2)}</span><span className={`ch ${cls(f.pctChange)}`}>{sign(f.pctChange)}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pf-detail">
            <div className="pf-ctx">
              {[
                ["Shares", "48"], ["Market value", "$56,724"], ["Weight", "28.4%"], ["Day", "+8.23%"],
                ["Unrealized G/L", "+$23,188"], ["Conviction", "High"],
              ].map(([k, v]) => (
                <div key={k} className="m">
                  <span className="k">{k}</span>
                  <span className="v">{k === "Conviction" ? <span className="pill up">{v}</span> : v}</span>
                </div>
              ))}
              <div className="sp" />
              <button className="btn">Trim &frac12;</button>
              <button className="btn">Sell all</button>
            </div>
            <StockDetailContent />
          </div>
        </div>
      </div>
    </ScaledScreen>
  );
}
