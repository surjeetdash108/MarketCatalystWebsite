"use client";

import { useCallback, useRef, useState } from "react";
import { tone, type Workspace } from "./data";

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

  const tab = w.win.tabs[active];
  const row = picked === null ? null : tab.rows[picked];

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
            {w.num} / {w.name}
          </span>
          <span>{w.tag}</span>
        </div>

        <div className="mc-panel-body">
          <div className="mc-panel-copy">
            <h3 className="mc-h3">{w.title}</h3>
            <p className="mc-panel-p">{w.body}</p>

            <div className="mc-metrics">
              {w.metrics.map((m) => (
                <div className="mc-metric" key={m.k}>
                  <b>{m.k}</b>
                  <span style={{ color: tone(m.tone) }}>{m.v}</span>
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
                <span>{w.win.title}</span>
                <span className="mc-win-stamp">{w.win.stamp}</span>
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
                    {t.label}
                  </button>
                ))}
                <span className="mc-win-live">LIVE</span>
              </div>

              <div id={panelId} role="tabpanel" aria-labelledby={`${panelId}-tab-${active}`}>
                <div className="mc-win-cols">
                  {tab.cols.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>

                {tab.rows.map((r, i) => (
                  <button
                    type="button"
                    key={r.a + r.b}
                    aria-pressed={i === picked}
                    className={`mc-win-row${i === picked ? " is-picked" : ""}`}
                    onClick={() => setPicked(i === picked ? null : i)}
                  >
                    <span className="mc-win-a">{r.a}</span>
                    <span className="mc-win-b">{r.b}</span>
                    <span className="mc-win-c" style={{ color: tone(r.tone) }}>
                      {r.c}
                    </span>
                    <span className="mc-win-d">
                      <i style={{ width: r.w, background: tone(r.tone) }} />
                      <span>{r.d}</span>
                    </span>
                  </button>
                ))}
              </div>

              {/* The strip either summarises the tab or, once a row is
                  pinned, reads that row back in full — including the two
                  columns the narrow layout drops. */}
              <div className={`mc-win-foot${row ? " is-detail" : ""}`} aria-live="polite">
                <i>◆</i>
                {row ? (
                  <>
                    <b>{row.a}</b>
                    <span>
                      {tab.cols[1].toLowerCase()} {row.b} · {tab.cols[2].toLowerCase()} {row.c} ·{" "}
                      {tab.cols[3].toLowerCase()} {row.d}
                    </span>
                  </>
                ) : (
                  <span>{tab.foot}</span>
                )}
              </div>
            </div>

            <div className="mc-spark" aria-hidden="true">
              {w.spark.map((s, i) => (
                <i key={i} style={{ height: s.h, background: tone(s.tone) }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
