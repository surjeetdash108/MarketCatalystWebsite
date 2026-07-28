import { ScaledScreen } from "./ScaledScreen";
import { Spark } from "./Spark";
import { movers } from "./data";
import { fmt, sign, cls } from "./utils";

export function MoversThumb() {
  const tabs = [["win", "Top Gainers"], ["lose", "Top Losers"], ["vol", "Unusual Volume"], ["week", "Weekly Movers"]];
  const list = [...movers].filter((m) => m.pctChange > 0).sort((a, b) => b.pctChange - a.pctChange).slice(0, 15);
  const tally: Record<string, number> = {};
  list.forEach((m) => {
    tally[m.sector] = (tally[m.sector] || 0) + 1;
  });
  const tallyEntries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const trending = [
    { s: "NVDA", n: 3 }, { s: "AAPL", n: 2 }, { s: "META", n: 2 },
  ];
  return (
    <ScaledScreen>
      <div className="page-head" style={{ padding: "28px 40px 20px" }}>
        <div>
          <div className="eyebrow">Market Movers</div>
          <h1 className="page-title">Winners &amp; Losers</h1>
          <div className="page-sub">Top 15 gainers today &middot; click any stock to see why it moved</div>
        </div>
        <div className="tabs">
          {tabs.map(([k, l], i) => (
            <button key={k} className={`tab${i === 0 ? " active" : ""}`}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="card-h">
            <h3>&#128293; Trending across reports</h3>
            <span className="pill" style={{ background: "var(--surface-3)", color: "var(--text-dim-solid)" }}>{trending.length} names</span>
          </div>
          <div className="card-b" style={{ paddingTop: 8, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {trending.map((o) => (
              <button key={o.s} className="tr-pill">
                <span className="tr-tk">{o.s}</span>
                <span className="tr-mt">{o.n} reports</span>
              </button>
            ))}
          </div>
        </div>
        <div className="fbar">
          <span style={{ fontSize: ".72rem", color: "var(--text-dim-solid)", alignSelf: "center" }}>Sector</span>
          <select className="mv-sel"><option>All</option><option>Technology</option><option>Finance</option></select>
          <span style={{ fontSize: ".72rem", color: "var(--text-dim-solid)", alignSelf: "center", marginLeft: 10 }}>Market cap</span>
          <select className="mv-sel"><option>All</option><option>Mega</option><option>Large</option></select>
          <div className="spacer" />
          <span style={{ fontSize: ".72rem", color: "var(--text-dim-solid)" }}>{list.length} stocks</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
          {tallyEntries.map(([k, v]) => (
            <span key={k} className="pill" style={{ background: "var(--surface-3)", color: "var(--text-dim-solid)" }}>
              {k} <b style={{ color: "var(--text-hi)" }}>{v}</b>
            </span>
          ))}
        </div>
        <div className="card" style={{ overflow: "visible" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Company</th><th className="num">Price</th><th className="num">Change</th><th className="num">RVOL</th>
                <th>Cap &middot; Sector</th><th>Catalyst</th><th className="num">Intraday</th>
              </tr>
            </thead>
            <tbody>
              {movers.map((m) => (
                <tr key={m.ticker} style={{ cursor: "pointer" }}>
                  <td><div className="co"><span className="s">{m.ticker}</span><span className="n">{m.name}</span></div></td>
                  <td className="num">${fmt(m.price, 2)}</td>
                  <td className={`num ${cls(m.pctChange)}`}>{sign(m.pctChange)}</td>
                  <td className="num"><b style={{ color: m.rvolRatio > 3 ? "var(--warn)" : "var(--text)" }}>{m.rvolRatio.toFixed(1)}&times;</b></td>
                  <td><span style={{ fontSize: ".74rem" }}><b style={{ color: "var(--text-hi)" }}>{m.cap}</b> &middot; <span style={{ color: "var(--text-dim-solid)" }}>{m.sector}</span></span></td>
                  <td><span className="pill" style={{ background: "var(--surface-3)", color: "var(--brand-2)" }}>{m.catalystLabel}</span></td>
                  <td className="num"><Spark idx={m.ticker.charCodeAt(0) % 8} up={m.pctChange >= 0} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ScaledScreen>
  );
}
