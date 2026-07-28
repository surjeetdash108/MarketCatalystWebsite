import { genOHLC, CandleChart } from "./CandleChart";
import { EarnIncChart } from "./EarnIncChart";
import { sectorList } from "./data";
import { sign } from "./utils";

// Shared stock detail content — used by StockThumb and PortfolioThumb's pf-detail.
export function StockDetailContent() {
  const price = 1181.75, chg = 8.23, rs = 98;
  const dollar = (chg / 100) * price;
  const ohlc = genOHLC("NVDA", "1D", price, chg, rs);

  return (
    <>
      <div className="sd-head">
        <div
          className="sd-logo"
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: "linear-gradient(135deg,#1f6b4d,#0e3a2a)",
            color: "#5ff0b3",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--f-display)",
            fontWeight: 800,
            fontSize: "1.125rem",
          }}
        >
          N
        </div>
        <div className="sd-name">
          <h1 style={{ fontFamily: "var(--f-mono)", fontSize: "1.5rem", fontWeight: 700, color: "var(--text-hi)", letterSpacing: "-.01em", margin: 0 }}>
            NVDA
          </h1>
          <div className="sub" style={{ fontSize: ".8rem", color: "var(--text-dim-solid)" }}>
            NVIDIA Corp &middot; NASDAQ &middot; Semiconductors
          </div>
        </div>
        <div className="sd-px" style={{ marginLeft: 8 }}>
          <div className="p" style={{ fontFamily: "var(--f-mono)", fontSize: "1.7rem", fontWeight: 700, color: "var(--text-hi)" }}>
            ${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="c up" style={{ fontFamily: "var(--f-mono)", fontSize: ".86rem", fontWeight: 600 }}>
            &#9650; +${dollar.toFixed(2)} (+{chg.toFixed(2)}%)
          </div>
        </div>
        <div className="sd-actions">
          <button className="btn">Watch</button>
          <button className="btn ai">Ask Copilot</button>
        </div>
      </div>
      <div className="sd-grid">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Chart card */}
          <div className="card">
            <div className="chart-toolbar">
              {["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"].map((t, i) => (
                <button key={t} className={`rng${i === 0 ? " on" : ""}`}>
                  {t}
                </button>
              ))}
              <span style={{ width: 1, height: 16, background: "var(--border)", margin: "0 4px" }} />
              {["Candles", "Hollow", "Bars", "Line", "Area"].map((t, i) => (
                <button key={t} className={`rng${i === 0 ? " on" : ""}`}>
                  {t}
                </button>
              ))}
              <button className="rng">MA</button>
              <button className="rng">EMA</button>
              <button className="rng">Volume</button>
              <button className="rng">RSI</button>
              <div style={{ flex: 1 }} />
              <span style={{ fontSize: ".72rem", color: "var(--text-dim-solid)" }}>drag-free &middot; hover for OHLC</span>
            </div>
            <CandleChart data={ohlc} />
            <div style={{ padding: "6px 14px 12px", fontSize: ".7rem", color: "var(--text-dim-solid)" }}>
              Pattern: <b style={{ color: "var(--up)" }}>cup-with-handle breakout</b> on above-average volume.
            </div>
          </div>
          {/* Key stats */}
          <div className="card">
            <div className="keystats">
              {[
                ["Mkt Cap", "$2.91T"], ["P/E", "71.4"], ["Revenue (TTM)", "$78.0B"], ["EPS (TTM)", "$16.55"],
                ["Short Int.", "1.1%"], ["Next ER", "Aug 28"], ["52W Range", "$685 – $1,205"], ["Avg Vol", "30M"],
              ].map(([k, v]) => (
                <div key={k} className="kstat">
                  <div className="k">{k}</div>
                  <div className="v">{v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* AI Technical Analysis */}
          <div className="ai-block">
            <div className="card-h">
              <h3 className="ai-c">&#9670; AI Technical Analysis</h3>
              <div className="toneseg" style={{ width: 280 }}>
                {["Summary", "Swing", "Position", "Long-term"].map((t, i) => (
                  <button key={t} className={i === 1 ? "on" : ""}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="card-b">
              {[
                ["Trend", "<b>Strong uptrend.</b> Higher highs and higher lows; momentum confirmed by recent strength."],
                ["Support / Resist.", "Support near <b>$1,140</b> and <b>$1,099</b>; resistance at <b>$1,217</b> then the 52-week high <b>$1,205</b>."],
                ["MA posture", "Above the 20, 50 and 200-day — bullish alignment."],
                ["Rel. strength", 'Relative-strength rank <b class="up">98/99</b> vs the market — group leader.'],
                ["Volume", "Relative volume <b>4.2×</b> — well above average (event-driven)."],
                ["Event risk", "Next earnings Aug 28 (~99 days). Macro: a hawkish Fed surprise pressures high-multiple names first."],
              ].map(([k, v]) => (
                <div key={k} className="ai-line">
                  <span className="k">{k}</span>
                  <span className="v" dangerouslySetInnerHTML={{ __html: v as string }} />
                </div>
              ))}
              <div style={{ marginTop: 10, fontSize: ".7rem", color: "var(--text-dim-solid)" }}>
                Source: 250-day OHLCV, 20/50/200 SMA, RS vs SPX &middot; AI-generated &middot; not investment advice.
              </div>
            </div>
          </div>
          {/* Financials */}
          <div className="card">
            <div className="card-h">
              <h3>Financials</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="tf-pills">
                  <button className="rng">Quarterly</button>
                  <button className="rng on">Annual</button>
                </div>
                <span className="link">View all →</span>
              </div>
            </div>
            <div className="card-b" style={{ paddingTop: 8 }}>
              <div className="ec-legend">
                <span><i style={{ background: "var(--brand)" }} />Revenue</span>
                <span><i style={{ background: "var(--ai)" }} />Gross profit</span>
                <span><i style={{ background: "var(--up)" }} />Net income</span>
              </div>
              <EarnIncChart />
              <div style={{ fontSize: ".68rem", color: "var(--text-dim-solid)", marginTop: 6 }}>
                Last 4 quarters &middot; revenue, gross profit &amp; net income &middot; tap &quot;View all&quot; for the full statement.
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card">
            <div className="card-h">
              <h3>Technical Rating</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div className="tf-pills">
                  {["1D", "1W", "1M"].map((t, i) => (
                    <button key={t} className={`rng${i === 2 ? " on" : ""}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <span className="link">View all →</span>
              </div>
            </div>
            <div className="card-b">
              <div className="trgroup" style={{ borderColor: "var(--ai-dim,rgba(52,226,240,.2))", marginBottom: 10 }}>
                <div className="gl ai-c">Summary</div>
                <div className="rate" style={{ color: "#22c55e" }}>Strong Buy</div>
                <div className="counts">
                  <span style={{ color: "var(--down)" }}>Sell<b>2</b></span>
                  <span style={{ color: "var(--text-dim-solid)" }}>Neut<b>3</b></span>
                  <span style={{ color: "var(--up)" }}>Buy<b>12</b></span>
                </div>
              </div>
              <div className="trseg2">
                <div className="trgroup">
                  <div className="gl">Oscillators</div>
                  <div className="rate" style={{ color: "#22c55e" }}>Buy</div>
                  <div className="counts">
                    <span style={{ color: "var(--down)" }}>Sell<b>1</b></span>
                    <span style={{ color: "var(--text-dim-solid)" }}>Neut<b>2</b></span>
                    <span style={{ color: "var(--up)" }}>Buy<b>6</b></span>
                  </div>
                </div>
                <div className="trgroup">
                  <div className="gl">Moving Avgs</div>
                  <div className="rate" style={{ color: "#22c55e" }}>Strong Buy</div>
                  <div className="counts">
                    <span style={{ color: "var(--down)" }}>Sell<b>1</b></span>
                    <span style={{ color: "var(--text-dim-solid)" }}>Neut<b>1</b></span>
                    <span style={{ color: "var(--up)" }}>Buy<b>7</b></span>
                  </div>
                </div>
              </div>
              <table className="ind-tbl" style={{ marginTop: 12 }}>
                <tbody>
                  {[
                    ["RSI (14)", "73.28", "Sell"], ["MACD (12,26)", "21.4", "Buy"], ["Stoch %K", "82.9", "Sell"],
                    ["ADX (14)", "36.5", "Buy"], ["EMA 50", "$1,111", "Buy"], ["SMA 200", "$875", "Buy"],
                  ].map(([ind, val, act]) => (
                    <tr key={String(ind)}>
                      <td>{ind}</td>
                      <td className="v">{val}</td>
                      <td className="a" style={{ color: act === "Buy" ? "var(--up)" : act === "Sell" ? "var(--down)" : "var(--text-dim-solid)" }}>
                        {act}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: ".66rem", color: "var(--text-dim-solid)", marginTop: 8 }}>
                Computed from 11 oscillators + 15 moving averages.
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h">
              <h3>Peers &middot; who&apos;s leading</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 6 }}>
              {(
                [
                  ["NVDA", 8.23, "Leader"], ["AMD", 2.10, ""], ["AVGO", 2.97, ""], ["INTC", -1.80, "Laggard"], ["QCOM", 1.30, ""],
                ] as [string, number, string][]
              ).map(([t, c, tag]) => (
                <div key={t} className={`minirow${t === "NVDA" ? " owned" : ""}`}>
                  <span className="tkr">{t}</span>
                  <span className="mid">{tag ? <span className={`pill ${tag === "Leader" ? "up" : "dn"}`}>{tag}</span> : ""}</span>
                  <span className={`r ${c >= 0 ? "up" : "down"}`}>
                    {c >= 0 ? "+" : ""}
                    {c.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-h">
              <h3>Industry Group rank</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="pill up">Improving</span>
                <span className="link">View all →</span>
              </div>
            </div>
            <div className="card-b">
              {sectorList.slice(0, 5).map((g) => (
                <div key={g.name} className="grouprow">
                  <span className="rk">{g.rank}</span>
                  <span className="gn">{g.name}</span>
                  <span className="bar"><i style={{ width: `${Math.max(8, 100 - g.rank * 1.6)}%` }} /></span>
                  <span style={{ fontFamily: "var(--f-mono)", fontSize: ".72rem", color: "var(--text-dim-solid)" }}>{sign(g.pctChange)}</span>
                </div>
              ))}
              <div style={{ fontSize: ".72rem", color: "var(--text-dim-solid)", marginTop: 8 }}>
                Semiconductors ranks <b style={{ color: "var(--up)" }}>#1 of {sectorList.length}</b> groups.
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-h">
              <h3>Earnings history</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="pill up">7-qtr beat streak</span>
                <span className="link">View all →</span>
              </div>
            </div>
            <div className="card-b" style={{ paddingTop: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                <div className="cd">
                  <span className="num">99</span>
                  <span className="u">
                    days to
                    <br />
                    next ER
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: ".66rem", color: "var(--text-dim-solid)", marginBottom: 4 }}>Beat / miss streak</div>
                  <div className="streak">
                    {[1, 1, 1, 1, 1, 1, 1, 0].map((b, i) => (
                      <b key={i} style={{ background: b ? "var(--up)" : "var(--down)" }}>
                        {b ? "B" : "M"}
                      </b>
                    ))}
                  </div>
                </div>
              </div>
              {[
                ["Q1 25", "$4.39 EPS", "beat 12%"], ["Q4 24", "$4.10 EPS", "beat 8%"],
                ["Q3 24", "$3.93 EPS", "beat 6%"], ["Q2 24", "$3.73 EPS", "beat 5%"],
              ].map(([q, eps, res]) => (
                <div key={q} className="minirow">
                  <span className="tkr" style={{ width: 60 }}>{q}</span>
                  <span className="mid mono">{eps}</span>
                  <span className="r up">{res}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-h">
              <h3>Insider &amp; Institutional</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 6 }}>
              <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-dim-solid)", margin: "2px 0 5px" }}>
                Recent insider transactions
              </div>
              {[
                { dir: "buy", role: "CEO", val: "$42M", date: "May 18" },
                { dir: "sell", role: "CFO", val: "$8.2M", date: "May 15" },
              ].map((x, i) => (
                <div key={i} className="minirow">
                  <span className="tkr" style={{ width: 60 }}>{x.date}</span>
                  <span className="mid">{x.dir === "buy" ? "Buy" : "Sell"} &middot; {x.role}</span>
                  <span className={`r ${x.dir === "buy" ? "up" : "down"}`}>
                    {x.dir === "buy" ? "+" : "−"}
                    {x.val}
                  </span>
                </div>
              ))}
              <div style={{ height: 1, background: "var(--border-soft)", margin: "12px 0 8px" }} />
              <div style={{ fontSize: ".72rem", fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--text-dim-solid)", marginBottom: 4 }}>
                Institutional
              </div>
              {[
                ["Inst. ownership", "66%", "up"], ["Short interest", "1.1%", "dim"], ["13F funds holding", "4 tracked", "dim"],
              ].map(([k, v, c]) => (
                <div key={k} className="minirow">
                  <span className="mid">{k}</span>
                  <span className="r" style={{ color: c === "dim" ? "var(--text-hi)" : c === "up" ? "var(--up)" : "var(--down)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-h">
              <h3>Key levels (pivots)</h3>
              <span className="link">View all →</span>
            </div>
            <div className="card-b" style={{ paddingTop: 6 }}>
              {(
                [
                  ["R2", 1252.7, "down"], ["R1", 1217.2, "down"], ["Pivot", 1181.75, "dim"], ["S1", 1140.4, "up"], ["S2", 1099.0, "up"],
                ] as [string, number, string][]
              ).map(([lv, pr, c]) => (
                <div key={lv} className="minirow">
                  <span className="tkr" style={{ width: 50 }}>{lv}</span>
                  <span className="mid" />
                  <span className="r mono" style={{ color: c === "dim" ? "var(--text-hi)" : `var(--${c})` }}>
                    ${Math.round(pr as number).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
