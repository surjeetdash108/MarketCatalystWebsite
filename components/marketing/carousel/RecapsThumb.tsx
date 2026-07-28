import { ScaledScreen } from "./ScaledScreen";
import { Spark } from "./Spark";
import { pulse, recap, sectorList } from "./data";
import { fmt, sign, cls, heatCol } from "./utils";

export function RecapsThumb() {
  return (
    <ScaledScreen>
      <div className="page-head" style={{ padding: "28px 40px 20px" }}>
        <div>
          <div className="eyebrow">Recaps</div>
          <h1 className="page-title">End-of-Day Recap</h1>
          <div className="page-sub">Tuesday, May 21 &middot; auto-generated 4:31 ET</div>
        </div>
        <div className="tabs">
          <button className="tab active">Today (EOD)</button>
          <button className="tab">This Week</button>
        </div>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div className="rcp-idx">
          {pulse.slice(0, 6).map((p, i) => (
            <div key={p.label} className="rcp-box">
              <div className="rcp-bl">{p.label}</div>
              <div className="rcp-bv">{fmt(p.value, p.value > 1000 ? 0 : 2)}</div>
              <div className={`rcp-bc ${cls(p.change)}`}>{sign(p.change)}</div>
              <div className="rcp-bs"><Spark idx={i + 1} up={p.change >= 0} /></div>
            </div>
          ))}
        </div>
        <div className="recap-hero">
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
            <div className="wmn-orb">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9z" fill="currentColor" />
              </svg>
            </div>
            <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text-hi)", cursor: "pointer" }}>
              {recap.headline} <span style={{ fontSize: ".7rem", color: "var(--brand-2)", fontWeight: 600 }}>↓ open PDF</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
            {recap.indices.map((x) => (
              <div key={x.label}>
                <div style={{ fontSize: ".7rem", color: "var(--text-dim-solid)" }}>{x.label}</div>
                <div className={`mono ${cls(x.value)}`} style={{ fontSize: "1.25rem", fontWeight: 700 }}>{sign(x.value)}</div>
              </div>
            ))}
            <div style={{ marginLeft: "auto" }}>
              <button className="btn ai">&#9654; 60-sec audio recap</button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 4 }}>
            <span style={{ fontSize: ".72rem", color: "var(--text-dim-solid)", fontWeight: 600, letterSpacing: ".03em" }}>DOWNLOAD PDF:</span>
            {["Today (EOD)", "Yesterday", "Last week"].map((l) => (
              <button key={l} className="btn">
                <svg viewBox="0 0 24 24" fill="none" style={{ width: 14, height: 14 }}>
                  <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>{" "}
                {l}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 14 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="eyebrow">Key stories</div>
                <span className="link">View all →</span>
              </div>
              {recap.stories.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", fontSize: ".84rem" }}>
                  <span className="bullet" style={{ marginTop: 6 }} />
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="eyebrow">Up next · tomorrow</div>
                <span className="link">View all →</span>
              </div>
              {recap.tomorrow.map((t, i) => (
                <div key={i} className="minirow">
                  <span className="mono" style={{ width: 54, color: "var(--warn)" }}>{t.time}</span>
                  <span className="mid">{t.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card-h">
            <h3>Sector heatmap</h3>
            <span className="link">View all →</span>
          </div>
          <div className="card-b">
            <div className="heat">
              {sectorList.slice(0, 10).map((s) => {
                const hc = heatCol(s.pctChange);
                return (
                  <div key={s.name} className="s" style={{ cursor: "pointer", background: hc.bg }}>
                    <div className="nm" style={{ color: hc.fg }}>{s.name}</div>
                    <div className="v" style={{ color: hc.fg }}>{sign(s.pctChange)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="dash" style={{ marginTop: 14 }}>
          <div className="col-6">
            <div className="card">
              <div className="card-h">
                <h3>Biggest earnings movers</h3>
                <span className="link">View all →</span>
              </div>
              <div className="card-b" style={{ paddingTop: 6 }}>
                {recap.movers.map((m) => (
                  <div key={m.ticker} className="minirow">
                    <span className="tkr">{m.ticker}</span>
                    <span className="mid">{m.reason}</span>
                    <span className={`r ${cls(m.pctChange)}`}>{sign(m.pctChange)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card">
              <div className="card-h">
                <h3>Market internals</h3>
                <span className="link">View all →</span>
              </div>
              <div className="card-b" style={{ paddingTop: 6 }}>
                {recap.internals.map((r) => (
                  <div key={r.label} className="minirow">
                    <span className="mid">{r.label}</span>
                    <span className={`r ${r.direction > 0 ? "up" : "down"}`}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScaledScreen>
  );
}
