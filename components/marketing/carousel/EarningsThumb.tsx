import { ScaledScreen } from "./ScaledScreen";
import { EarnEpsChart, earnHistory } from "./EarnEpsChart";
import { EarnIncChart } from "./EarnIncChart";
import { earnings } from "./data";

function EcChip({ e, selected }: { e: { ticker: string; name: string }; selected: boolean }) {
  return (
    <button className={`ec-chip${selected ? " on" : ""}`}>
      <span className="ec-logo" style={{ background: "#27314a", color: "#cdd6e6", position: "relative" }}>
        {e.ticker[0]}
      </span>
      {e.ticker}
    </button>
  );
}

export function EarningsThumb() {
  const ranges = [["yest", "Yesterday"], ["today", "Today"], ["tom", "Tomorrow"], ["week", "This Week"], ["next", "Next Week"], ["prev", "Last Week"], ["month", "Month"]];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const bmo = earnings.filter((e) => e.session.includes("pre"));
  const amc = earnings.filter((e) => e.session.includes("post"));
  const sel = earnings[0];
  const hist = earnHistory("NVDA", 1181.75, 71.4);
  const beats = hist.filter((h) => h.surp > 0).length;
  const avgMv = (hist.reduce((a, h) => a + Math.abs(h.mv), 0) / hist.length).toFixed(1);
  return (
    <ScaledScreen>
      <div className="page-head" style={{ padding: "28px 40px 20px" }}>
        <div>
          <div className="eyebrow">Earnings Workspace</div>
          <h1 className="page-title">Earnings Calendar</h1>
          <div className="page-sub">
            Company logos by day &middot; before-open vs after-close &middot; or switch to <b style={{ color: "var(--text-hi)" }}>Month</b> for the full calendar
          </div>
        </div>
        <div className="tabs">
          {ranges.map(([k, l], i) => (
            <button key={k} className={`tab${i === 3 ? " active" : ""}`}>{l}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div className="ec-grid">
          {days.map((day, di) => {
            const bmoDay = earnings.slice(di * 2, di * 2 + 2).filter((e) => e.session.includes("pre"));
            const amcDay = earnings.slice(di * 2, di * 2 + 2).filter((e) => e.session.includes("post"));
            return (
              <div key={day} className={`ec-day${di === 1 ? " is-today" : ""}`}>
                <div className="ec-dh">{day}{di === 1 && " · Today"}</div>
                <div className="ec-sess">
                  <div className="ec-lbl">Before open</div>
                  {bmoDay.length ? (
                    bmo.slice(di, di + 2).map((e) => <EcChip key={e.ticker} e={e} selected={e.ticker === sel.ticker} />)
                  ) : (
                    <span className="ec-none">—</span>
                  )}
                </div>
                <div className="ec-sess">
                  <div className="ec-lbl">After close</div>
                  {amcDay.length ? (
                    amc.slice(di, di + 2).map((e) => <EcChip key={e.ticker} e={e} selected={false} />)
                  ) : (
                    <span className="ec-none">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="dash" style={{ marginTop: 16 }}>
          <div className="col-7">
            <div className="card">
              <div className="card-h">
                <h3>{sel.ticker} &middot; 10-quarter earnings history</h3>
                <span className="pill" style={{ background: "var(--surface-3)", color: "var(--text-dim-solid)" }}>{beats}/10 beats</span>
              </div>
              <div className="card-b" style={{ paddingTop: 8 }}>
                <div className="ec-legend">
                  <span><i style={{ background: "var(--surface-3)" }} />EPS estimate</span>
                  <span><i style={{ background: "var(--up)" }} />Beat</span>
                  <span><i style={{ background: "var(--down)" }} />Miss</span>
                  <span><i className="ln" style={{ background: "var(--brand-2)" }} />Stock move %</span>
                </div>
                <EarnEpsChart hist={hist} />
              </div>
            </div>
          </div>
          <div className="col-5">
            <div className="card">
              <div className="card-h">
                <h3>Income statement</h3>
                <span className="pill" style={{ background: "var(--surface-3)", color: "var(--text-dim-solid)" }}>Quarterly</span>
              </div>
              <div className="card-b" style={{ paddingTop: 8 }}>
                <div className="ec-legend">
                  <span><i style={{ background: "var(--brand)" }} />Revenue</span>
                  <span><i style={{ background: "var(--ai)" }} />Gross profit</span>
                  <span><i style={{ background: "var(--up)" }} />Net income</span>
                </div>
                <EarnIncChart />
              </div>
            </div>
          </div>
        </div>
        <div className="ai-block" style={{ marginTop: 2 }}>
          <div className="card-h">
            <h3 className="ai-c">&#9670; AI earnings read &middot; {sel.ticker}</h3>
          </div>
          <div className="card-b">
            <p style={{ fontSize: ".85rem", lineHeight: 1.6, color: "var(--text)" }}>
              NVDA beat EPS estimates. Guidance was raised — bullish. History shows{" "}
              <b style={{ color: "var(--text-hi)" }}>{beats}/10 beats</b> and an average post-print move of{" "}
              <b style={{ color: "var(--text-hi)" }}>{avgMv}%</b>. Watch revenue growth and forward guidance most.
            </p>
          </div>
        </div>
      </div>
    </ScaledScreen>
  );
}
