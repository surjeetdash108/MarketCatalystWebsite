import { ScaledScreen } from "./ScaledScreen";
import { sectorList } from "./data";
import { sign, cls, heatCol } from "./utils";

export function HeatmapThumb() {
  const k = 2.0;
  const page = sectorList.slice(0, 10);
  return (
    <ScaledScreen>
      <div className="page-head" style={{ padding: "28px 40px 20px" }}>
        <div>
          <div className="eyebrow">Market Heatmap</div>
          <h1 className="page-title">Where the day is leaning</h1>
          <div className="page-sub">{sectorList.length} industry groups &middot; size = market cap, color = % change &middot; tap a tile to open it</div>
        </div>
        <div className="tabs">
          {["Stocks", "S&P 500", "ETFs"].map((t, i) => (
            <button key={t} className={`tab${i === 0 ? " active" : ""}`}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div className="fbar">
          <button className="chip on">Color: % change</button>
          <button className="chip">Size: Market cap</button>
          <div className="spacer" />
          <div className="legend" style={{ display: "flex", alignItems: "center", gap: 3, fontSize: ".72rem", color: "var(--text-dim-solid)" }}>
            -3%&nbsp;
            {([-3, -1.5, -0.5, 0, 0.5, 1.5, 3] as number[]).map((v) => {
              const { bg } = heatCol(v);
              return <i key={v} style={{ display: "inline-block", width: 22, height: 12, background: bg, borderRadius: 2 }} />;
            })}
            &nbsp;+3%
          </div>
        </div>
        <div className="card">
          <div className="card-b">
            <div className="treemap">
              {page.map((g) => {
                const tot = g.items.reduce((s, it) => s + it[1], 0);
                return (
                  <div key={g.name} className="tm-sector" style={{ flex: `${Math.max(1, tot / 800)} 1 240px` }}>
                    <div className="sl" style={{ cursor: "pointer" }}>
                      <span>
                        {g.name} <span className={cls(g.pctChange)} style={{ fontFamily: "var(--f-mono)", fontWeight: 600 }}>{sign(g.pctChange)}</span>
                      </span>
                      <span style={{ color: "var(--brand-2)", fontWeight: 600 }}>View all →</span>
                    </div>
                    <div className="tm-cells">
                      {g.items.map((it) => {
                        const w = Math.max(56, Math.sqrt(it[1]) * k),
                          h = Math.max(42, Math.sqrt(it[1]) * k * 0.62);
                        const fs = Math.max(0.62, Math.min(1, Math.sqrt(it[1]) / 40));
                        const { bg, fg } = heatCol(it[2]);
                        return (
                          <div key={it[0]} className="tm-cell" style={{ width: w, height: h, background: bg }}>
                            <span className="tt" style={{ fontSize: `${fs}rem`, color: fg }}>{it[0]}</span>
                            <span className="tc" style={{ fontSize: `${fs * 0.8}rem`, color: fg, opacity: 0.85 }}>{sign(it[2])}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, fontSize: ".82rem" }}>
          <span style={{ color: "var(--text-dim-solid)" }}>
            Sectors <b style={{ color: "var(--text-hi)" }}>1–{page.length}</b> of {sectorList.length}
          </span>
          <span className="link">Show next 10 →</span>
        </div>
      </div>
    </ScaledScreen>
  );
}
