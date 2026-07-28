import { ScaledScreen } from "./ScaledScreen";
import { analyst } from "./data";
import { sign, cls } from "./utils";

export function AnalystThumb() {
  const clusters = [
    { s: "NVDA", name: "NVIDIA", up: 6, down: 0, n30: 6 },
    { s: "CRM", name: "Salesforce", up: 2, down: 0, n30: 3 },
  ];
  const multiUpgrades = [
    { s: "CRM", up: 2 },
    { s: "AMD", up: 2 },
  ];
  return (
    <ScaledScreen>
      <div className="page-head" style={{ padding: "28px 40px 20px" }}>
        <div>
          <div className="eyebrow">Analyst Actions</div>
          <h1 className="page-title">Upgrades &amp; Downgrades</h1>
          <div className="page-sub">Back-end flags stocks with 5+ actions in 30 days, and names drawing 2–3 upgrades</div>
        </div>
        <div className="tabs">
          {["All", "Upgrades", "Downgrades", "Initiations", "PT changes"].map((t, i) => (
            <button key={t} className={`tab${i === 0 ? " active" : ""}`}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "0 32px" }}>
        <div className="dash" style={{ marginBottom: 14 }}>
          <div className="col-6">
            <div className="card" style={{ borderColor: "var(--warn)" }}>
              <div className="card-h">
                <h3>&#128293; Cluster alert &middot; 5+ actions / 30d</h3>
                <span className="pill" style={{ background: "var(--surface-3)", color: "var(--warn)" }}>high conviction</span>
              </div>
              <div className="card-b" style={{ paddingTop: 4 }}>
                {clusters.map((c) => (
                  <div key={c.s} className="minirow">
                    <span className="tkr">{c.s}</span>
                    <span className="mid">
                      {c.name} &middot; {c.up} up / {c.down} down
                    </span>
                    <span className="r" style={{ color: "var(--warn)", fontWeight: 700 }}>{c.n30} /30d</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="col-6">
            <div className="card">
              <div className="card-h">
                <h3>&#9650; Multiple upgrades (2–3)</h3>
                <span className="pill up">trend turning</span>
              </div>
              <div className="card-b" style={{ paddingTop: 4 }}>
                {multiUpgrades.map((c) => (
                  <div key={c.s} className="minirow">
                    <span className="tkr">{c.s}</span>
                    <span className="mid">{c.up} upgrades recently</span>
                    <span className="r up" style={{ fontWeight: 700 }}>&#9650; {c.up}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="fbar">
          <button className="chip on">My names</button>
          <button className="chip">PT &gt;15% move</button>
          <button className="chip">Clusters only</button>
          <div className="spacer" />
        </div>
        <div className="dash">
          <div className="col-8">
            <div className="card">
              <div className="tbl-wrap">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Company</th><th>Firm</th><th>Action</th><th>Rating</th>
                      <th className="num">Price Target</th><th className="num">Reaction</th><th className="num">Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyst.map((a, i) => (
                      <tr key={i} style={{ cursor: "pointer" }}>
                        <td><div className="co"><span className="s">{a.ticker}</span><span className="n">{a.name}</span></div></td>
                        <td>{a.firm}</td>
                        <td>
                          {a.actionType === "up" ? (
                            <span className="pill up">&#9650; Upgrade</span>
                          ) : a.actionType === "down" ? (
                            <span className="pill dn">&#9660; Downgrade</span>
                          ) : a.actionType === "init" ? (
                            <span className="pill ai">&#9670; Initiate</span>
                          ) : (
                            <span className="pill hold">Reiterate</span>
                          )}
                        </td>
                        <td>
                          <span style={{ color: "var(--text-dim-solid)" }}>{a.previousRating}</span> &rarr; <b style={{ color: "var(--text-hi)" }}>{a.newRating}</b>
                        </td>
                        <td className="num">
                          {a.prevPriceTarget ? `$${a.prevPriceTarget}` : "—"} &rarr; <b style={{ color: "var(--text-hi)" }}>${a.newPriceTarget}</b>
                        </td>
                        <td className={`num ${cls(a.priceChangeSince)}`}>{sign(a.priceChangeSince)}</td>
                        <td className="num">{a.actionsLast30Days}&times; /30d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="col-4">
            <div className="ai-block">
              <div className="card-h">
                <h3 className="ai-c">&#9670; AI take &middot; CRM cluster</h3>
              </div>
              <div className="card-b">
                <p style={{ fontSize: ".85rem", lineHeight: 1.6, color: "var(--text)" }}>
                  CRM has drawn <b style={{ color: "var(--text-hi)" }}>two upgrades</b> this week with PTs to $330–340. NVDA shows a{" "}
                  <b style={{ color: "var(--text-hi)" }}>6-action cluster</b> in 30 days — dense coverage that often precedes continued momentum.
                </p>
                <div style={{ marginTop: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <span className="src-chip">CRM: 2 upgrades</span>
                  <span className="src-chip">NVDA: 6 / 30d</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScaledScreen>
  );
}
