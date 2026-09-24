"use client";

import { useCallback, useRef, useState } from "react";
import { tone } from "./data";
import type { Workspace } from "./workspaces";
import { ScreenerChart } from "./ScreenerChart";

/** The screener's real filter groups (app/screener page) — fixed chrome, not sample data. */
const SCREENER_FILTER_GROUPS = ["Relative Strength", "Growth", "Technical rating", "Liquidity & cap"];

/**
 * One stacked workspace panel — copy on the left, a working terminal window
 * on the right.
 *
 * The window is genuinely interactive rather than a screenshot: the three tabs
 * switch the table, and a row can be picked to read its detail. That is
 * deliberate. The product's claim is that the AI read follows the view you are
 * in, so the landing page proves it by changing the read when you change the
 * tab — you can feel the argument instead of being told it.
 *
 * The table is a miniature of the real screen: its tabs and column headers
 * are the app's own, while every figure is a seeded sample rendered blurred
 * (see workspaces.ts) — the shape is real, the numbers are not claimed to be.
 *
 * Client-side and stateful, but the data is a module constant compiled into
 * the page: switching tabs costs no network and no layout thrash, which
 * matters because these panels animate under a scroll-driven transform
 * (HomeMotion.tsx) and a paint stall here would show up as jank.
 */
export function WorkspacePanel({ w }: { w: Workspace }) {
  const [active, setActive] = useState(0);
  /** Index of the pinned row within the active tab, or null. */
  const [picked, setPicked] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // The Screener is the one workspace whose whole pitch is "every match
  // opens straight into its chart" — so unlike the other panels, its window
  // shows a live-looking candlestick instead of another data grid. Its tab
  // strip is relabelled with the app's filter groups (SCREENER_FILTER_GROUPS)
  // instead of the preset names, but it still switches the same four preset
  // screens underneath — clicking "Growth" still swaps results/chart/read.
  const isScreener = w.name === "Screener";
  const tab = w.win.tabs[active];
  const row = picked === null ? null : tab.rows[picked];
  const activeIdx = picked ?? 0;
  const activeRow = tab.rows[activeIdx];
  const matches = w.metrics.find((m) => m.k === "MATCHES");

  const select = useCallback((i: number) => {
    setActive(i);
    // A pinned row belongs to the tab it was pinned in; carrying the index
    // across would pin an unrelated row of the same rank.
    setPicked(null);
  }, []);

  /** Roving arrow-key focus, which is what a tablist is expected to do. */
  const onTabKey = (e: React.KeyboardEvent, i: number) => {
    const last = w.win.tabs.length - 1;
    let next: number | null = null;
    if (e.key === "ArrowRight") next = i === last ? 0 : i + 1;
    else if (e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  };

  const panelId = `mc-win-${w.num}`;

  return (
    <div className="mc-panel" data-panel="1">
      <div className="mc-panel-card">
        <div className="mc-panel-head">
          <span>
            {w.num} / <span className="mc-name">{w.name}</span>
          </span>
        </div>

        <div className="mc-panel-body">
          <div className="mc-panel-copy">
            <h3 className="mc-h3">{w.title}</h3>
            <p className="mc-panel-p">{w.body}</p>

            <div className="mc-metrics">
              {w.metrics.map((m) => (
                <div className="mc-metric" key={m.k}>
                  <b>{m.k}</b>
                  <span className={m.blur ? "mc-blur" : undefined} aria-hidden={m.blur || undefined} style={{ color: tone(m.tone) }}>
                    {m.v}
                  </span>
                </div>
              ))}
            </div>

            {/* aria-live so a screen reader hears the read change when the
                tab does — otherwise the whole demonstration is silent. */}
            <div className="mc-read" aria-live="polite">
              <b>◆ AI read · </b>
              {tab.read}
              <i />
            </div>
          </div>

          <div className="mc-panel-vis">
            <div className="mc-win">
              <div className="mc-win-bar">
                <span className="mc-win-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="mc-name">{w.name}</span>
              </div>

              <div className="mc-win-tabs" role="tablist" aria-label={`${w.name} views`} ref={tabsRef}>
                {w.win.tabs.map((t, i) => (
                  <button
                    type="button"
                    role="tab"
                    key={t.label}
                    id={`${panelId}-tab-${i}`}
                    aria-selected={i === active}
                    aria-controls={panelId}
                    // Only the selected tab is in the tab order; the arrows
                    // move between them once you are inside.
                    tabIndex={i === active ? 0 : -1}
                    className={`mc-win-tab${i === active ? " is-active" : ""}`}
                    onClick={() => select(i)}
                    onKeyDown={(e) => onTabKey(e, i)}
                  >
                    {/* The screener's tab strip is relabelled with the app's
                        filter groups, but it's the same four preset screens
                        underneath — picking one still swaps the data. */}
                    {isScreener ? SCREENER_FILTER_GROUPS[i] : t.label}
                  </button>
                ))}
                <span className="mc-win-live">PREVIEW</span>
              </div>

              <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-tab-${active}`}>
                {isScreener ? (
                  <div className="mc-scr">
                    <div className="mc-scr-body">
                      <div className="mc-scr-results">
                        <div className="mc-scr-results-head">
                          <span>Results</span>
                          {matches && (
                            <b className={matches.blur ? "mc-blur" : undefined} aria-hidden={matches.blur || undefined}>
                              {matches.v} matches
                            </b>
                          )}
                        </div>
                        <div className="mc-scr-list">
                          {tab.rows.map((r, i) => (
                            <button
                              type="button"
                              key={r.id}
                              aria-pressed={i === activeIdx}
                              className={`mc-scr-row${i === activeIdx ? " is-picked" : ""}`}
                              onClick={() => setPicked(i === picked ? null : i)}
                            >
                              <span className="mc-scr-sym mc-win-id">{r.id}</span>
                              <span className="mc-scr-px mc-blur" aria-hidden="true">
                                {r.cells[1].v}
                              </span>
                              <span className="mc-scr-rs mc-blur" aria-hidden="true" style={{ color: tone(r.cells[4].tone) }}>
                                RS {r.cells[3].v.replace("/99", "")} · {r.cells[4].v}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mc-scr-chart">
                        <div className="mc-scr-toolbar" aria-hidden="true">
                          <span className="is-on">3M</span>
                          <span className="is-on">Candles</span>
                          <span>MA</span>
                          <span>EMA</span>
                          <span className="is-on">Volume</span>
                          <span>RSI</span>
                          <span>Earnings</span>
                        </div>
                        <div className="mc-scr-canvas mc-blur" aria-hidden="true">
                          <ScreenerChart seed={`${w.name}|${tab.label}|${activeRow.id}`} />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Column count varies per tab, so the grid template is set
                     here — each column's share follows its content. Each
                     track floors at its natural width (colWidth() in
                     workspaces.ts) and grows from there, so on a window wide
                     enough every column fits with no sideways scroll; on a
                     phone-width card the floor wins first and .mc-win-grid
                     scrolls instead of truncating a header into "Convicti…". */
                  <div
                    className="mc-win-grid"
                    style={{ "--mc-cols": tab.widths.map((w) => `minmax(${w}px, ${w}fr)`).join(" ") } as React.CSSProperties}
                  >
                    <div className="mc-win-cols">
                      {tab.cols.map((c, i) => (
                        <span key={i} className={`is-${tab.align[i]}`} title={c}>
                          {c}
                        </span>
                      ))}
                    </div>

                    {tab.rows.map((r, i) => (
                      <button
                        type="button"
                        key={r.id}
                        aria-pressed={i === picked}
                        className={`mc-win-row${i === picked ? " is-picked" : ""}`}
                        onClick={() => setPicked(i === picked ? null : i)}
                      >
                        {r.cells.map((c, j) => (
                          <span
                            key={j}
                            className={`is-${tab.align[j]}${c.blur ? " mc-blur" : " mc-win-id"}`}
                            aria-hidden={c.blur || undefined}
                            style={c.blur || tab.align[j] !== "l" ? { color: tone(c.tone) } : undefined}
                          >
                            {c.v}
                          </span>
                        ))}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* The strip either summarises the tab or, once a row is
                  pinned, reads that row back — figures still blurred, since
                  they are samples. */}
              <div className={`mc-win-foot${row ? " is-detail" : ""}`} aria-live="polite">
                <i>◆</i>
                {row ? (
                  <>
                    <b>{row.id}</b>
                    <span>
                      {row.cells.map((c, j) =>
                        c.blur ? (
                          <em key={j}>
                            {tab.cols[j].toLowerCase()} <span className="mc-blur" aria-hidden="true">
                              {c.v}
                            </span>
                          </em>
                        ) : null,
                      )}
                    </span>
                  </>
                ) : (
                  <span>{tab.foot}</span>
                )}
              </div>
            </div>

            {/* The Screener already has a chart doing this job — a second,
                unrelated sparkline underneath would just be noise. */}
            {!isScreener && (
              <div className="mc-spark" aria-hidden="true">
                {w.spark.map((s, i) => (
                  <i key={i} style={{ height: s.h, background: tone(s.tone) }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
