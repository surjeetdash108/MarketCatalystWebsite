import { ScaledScreen } from "./ScaledScreen";
import { Spark } from "./Spark";
import { GaugeSVG } from "./GaugeSVG";
import { pulse, wmn, earnings, movers, analyst, sectorList, folio, watch } from "./data";
import { fmt, sign, cls, heatCol } from "./utils";

export function DashThumb() {
  const hmMini = sectorList.slice(0, 8).map((sd) => {
    const tot = sd.items.reduce((s, i) => s + i[1], 0);
    const { bg, fg } = heatCol(sd.pctChange);
    return (
      <div key={sd.name} style={{ background: bg, borderRadius: 7, padding: "8px 9px", flex: `${Math.max(1, tot / 1400)} 1 70px` }}>
        <div style={{ fontSize: ".6rem", fontWeight: 700, color: fg, lineHeight: 1.1 }}>
          {sd.name.replace("Mega-Cap ", "").replace("Cloud ", "")}
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: ".64rem", color: fg, opacity: 0.88, marginTop: 2 }}>{sign(sd.pctChange)}</div>
      </div>
    );
  });
  const insiderBuys = [
    { s: "NVDA", dir: "buy", role: "CEO", val: "$42M" },
    { s: "AAPL", dir: "buy", role: "CFO", val: "$8.2M" },
    { s: "META", dir: "sell", role: "Director", val: "$15M" },
  ];
  const feedItems = [
    { cat: "Earnings", col: "var(--up)", t: "NVDA beats EPS 18%, raises FY25", time: "9:31a" },
    { cat: "Analyst", col: "var(--brand-2)", t: "MS upgrades CRM to Overweight", time: "9:18a" },
    { cat: "Macro", col: "var(--warn)", t: "May core CPI +0.2% m/m, below est.", time: "8:30a" },
  ];
  return (
    <ScaledScreen>
      <div className="page-head" style={{ padding: "28px 40px 16px" }}>
        <div>
          <div className="eyebrow">Tuesday &middot; May 21 &middot; 10:24 ET</div>
          <h1 className="page-title">Good morning, Arvind</h1>
        </div>
      </div>
      <div className="dgrid" style={{ padding: "0 32px 20px" }}>
        <div className="col-12">
          <div className="pulse">
            {pulse.slice(0, 6).map((p, i) => {
              const dec = p.value > 1000 ? 0 : 2;
              return (
                <div key={p.label} className="p" style={{ cursor: "pointer" }}>
                  <div className="lbl">{p.label}</div>
                  <div className="val">{fmt(p.value, dec)}</div>
                  <div className={`chg ${cls(p.change)}`}>{sign(p.change)}</div>
                  <div className="pmeta" style={{ fontSize: ".6rem", color: "var(--text-dim-solid)" }}>
                    O {fmt(p.open ?? p.value * 0.99, dec)} &middot; PC {fmt(p.prevClose ?? p.value * 1.01, dec)}
                  </div>
                  <Spark idx={i} up={p.change >= 0} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-12">
          <div className="wmn">
            <div className="wmn-h">
              <div className="t">
                <div className="wmn-orb">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h2>What Matters Now</h2>
                  <div className="meta">
                    <span className="live">
                      <span className="dot" />&nbsp;Live
                    </span>
                    &nbsp;&middot; AI-curated
                  </div>
                </div>
              </div>
              <button className="btn ai" style={{ fontSize: ".72rem" }}>
                &#9654; 30-sec audio
              </button>
            </div>
            <ul className="wmn-body">
              {wmn.slice(0, 4).map((b, i) => (
                <li key={i}>
                  <span className="bullet" />
                  <span>
                    <b>{b.headline}.</b> <span dangerouslySetInnerHTML={{ __html: b.body }} />
                  </span>
                </li>
              ))}
            </ul>
            <div className="wmn-foot" style={{ display: "flex", gap: 6, padding: "8px 18px", borderTop: "1px solid var(--border)", fontSize: ".66rem", flexWrap: "wrap" }}>
              Sources used:<span className="src-chip">CPI release</span><span className="src-chip">NVDA 10-Q</span><span className="src-chip">Analyst feed</span>
              <span style={{ marginLeft: "auto", color: "var(--ai)" }}>AI-generated</span>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Earnings Today</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 4 }}>
              {earnings.slice(0, 5).map((e) => (
                <div key={e.ticker} className="minirow">
                  <span className="tkr">
                    {e.ticker}
                    <small>{e.name}</small>
                  </span>
                  <span className="mid">
                    <span className={`pill ${e.session.includes("pre") ? "bmo" : "amc"}`}>{e.session}</span>
                  </span>
                  <span className={`r ${e.epsActual !== null && e.epsEstimate !== null ? cls(e.epsActual - e.epsEstimate) : ""}`}>
                    {e.epsActual !== null && e.epsEstimate !== null ? (
                      sign(e.epsActual - e.epsEstimate)
                    ) : (
                      <span style={{ color: "var(--text-dim-solid)" }}>pending</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Market Movers</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 4 }}>
              {movers.slice(0, 5).map((m) => (
                <div key={m.ticker} className="minirow">
                  <span className="tkr">{m.ticker}</span>
                  <span className="mid">{m.catalystLabel}</span>
                  <span className={`r ${cls(m.pctChange)}`}>{sign(m.pctChange)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Market Heatmap</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 10 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{hmMini}</div>
              <div style={{ fontSize: ".66rem", color: "var(--text-dim-solid)", marginTop: 9 }}>Tap to open the full heatmap.</div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Analyst Actions</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 4 }}>
              {analyst.slice(0, 5).map((a, i) => (
                <div key={i} className="minirow">
                  <span className="tkr">{a.ticker}</span>
                  <span className="mid">
                    {a.firm} &rarr; <b style={{ color: "var(--text-hi)" }}>{a.newRating}</b>
                  </span>
                  <span className="r">
                    {a.actionType === "up" ? (
                      <span className="up">&#9650; Upg</span>
                    ) : a.actionType === "down" ? (
                      <span className="down">&#9660; Dng</span>
                    ) : a.actionType === "init" ? (
                      <span className="ai-c">&#9670; Init</span>
                    ) : (
                      <span style={{ color: "var(--text-dim-solid)" }}>Reit</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Screener &middot; Leaders &amp; Laggards</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 4 }}>
              <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", margin: "0 0 4px", color: "var(--up)" }}>
                &#9650; Leaders
              </div>
              {sectorList.slice(0, 3).map((g) => (
                <div key={g.name} className="minirow">
                  <span className="tkr">{g.name.split(" ")[0]}</span>
                  <span className="mid">
                    RS {g.rank} &middot; {g.name.split(" ").slice(1).join(" ")}
                  </span>
                  <span className={`r ${cls(g.pctChange)}`}>{sign(g.pctChange)}</span>
                </div>
              ))}
              <div style={{ fontSize: ".6rem", fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", margin: "8px 0 4px", color: "var(--down)" }}>
                &#9660; Laggards
              </div>
              {sectorList.slice(-3).map((g) => (
                <div key={g.name} className="minirow">
                  <span className="tkr">{g.name.split(" ")[0]}</span>
                  <span className="mid">
                    RS {g.rank} &middot; {g.name.split(" ").slice(1).join(" ")}
                  </span>
                  <span className={`r ${cls(g.pctChange)}`}>{sign(g.pctChange)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Portfolio Pulse</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <span className="mono" style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-hi)" }}>$128,430</span>
                <span className="mono up" style={{ fontWeight: 600 }}>&#9650; +1.42%</span>
              </div>
              {folio.slice(0, 4).map((f) => (
                <div key={f.ticker} className="minirow">
                  <span className="tkr">{f.ticker}</span>
                  <span className="mid">
                    {f.positionSize} &middot; {f.conviction} conv.
                  </span>
                  <span className={`r ${cls(f.pctChange)}`}>{sign(f.pctChange)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Watchlist</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 8 }}>
              {watch.slice(0, 5).map((w) => (
                <div key={w.ticker} className="minirow">
                  <span className="tkr">{w.ticker}</span>
                  <span className="mid">
                    {w.hasOptions && <span className="pill opt">&#9889;</span>} ER {w.nextEarningsDate}
                  </span>
                  <span className={`r ${cls(w.pctChange)}`}>{sign(w.pctChange)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Insider &amp; Institutional</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 4 }}>
              {insiderBuys.map((x, i) => (
                <div key={i} className="minirow">
                  <span className="tkr">{x.s}</span>
                  <span className="mid">
                    {x.dir === "buy" ? "Buy" : "Sell"} &middot; {x.role}
                  </span>
                  <span className={`r ${x.dir === "buy" ? "up" : "down"}`}>
                    {x.dir === "buy" ? "+" : "−"}
                    {x.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Live Market Feed</h3>
              <span className="link">Commentary →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 2 }}>
              {feedItems.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid var(--border-soft,#1a2535)" }}>
                  <div style={{ flexShrink: 0, width: 62 }}>
                    <span className="pill" style={{ background: "var(--surface-3)", color: f.col, fontSize: ".6rem" }}>{f.cat}</span>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: ".6rem", color: "var(--text-dim-solid)", marginTop: 5 }}>{f.time}</div>
                  </div>
                  <div style={{ fontSize: ".78rem", color: "var(--text)" }}>{f.t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card vix">
            <div className="card-h">
              <h3>VIX &middot; Volatility</h3>
              <span className="pill up">Calm</span>
            </div>
            <div className="card-b">
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span className="big">14.18</span>
                <span className="mono down" style={{ fontWeight: 600 }}>&#9660; -2.51%</span>
              </div>
              <div className="pctl"><i style={{ width: "22%" }} /></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".66rem", color: "var(--text-dim-solid)", marginBottom: 10 }}>
                <span>12-mo pct: 22nd</span>
                <span>Trend: falling</span>
              </div>
              <div className="note">VIX at 14 is low — a calm, risk-on tape.</div>
            </div>
          </div>
        </div>
        <div className="col-4">
          <div className="card">
            <div className="card-h">
              <h3>Fear &amp; Greed</h3>
              <span className="link">History →</span>
            </div>
            <div className="card-b gauge-wrap">
              <GaugeSVG val={62} />
              <div className="gauge-num up">62</div>
              <div className="gauge-lbl up">Greed</div>
              <div style={{ fontSize: ".7rem", color: "var(--text-dim-solid)" }}>Previous close: 58</div>
            </div>
          </div>
        </div>
      </div>
    </ScaledScreen>
  );
}
