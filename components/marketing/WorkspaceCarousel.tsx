"use client";

import { useEffect, useRef } from "react";
import { WS_LIST } from "./carousel/workspaces";
import { APP_SIGNUP_URL } from "./app-url";

// The scroll-driven "workspace tour" marquee from MarketCatalystUI's landing
// page. Ported as its own client-only leaf component (refs, rAF, DOM
// measurement) so the rest of the marketing page can still server-render.
//
// Note: the source page also had a "glance" preview modal (`glanceIdx`
// state), but nothing in the original ever called `setGlanceIdx` with a real
// index — it was unreachable dead code — so it is not reproduced here.
// Clicking the front (centered) card used to open a login/signup modal;
// since this site has no customer-facing auth, it now navigates straight to
// the trading app's signup page instead.
export function WorkspaceCarousel() {
  const trackRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const capRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  // Scroll-driven marquee animation
  useEffect(() => {
    function tick() {
      const track = trackRef.current;
      const row = rowRef.current;
      if (track && row) {
        const r = track.getBoundingClientRect();
        const range = track.offsetHeight - window.innerHeight;
        const p = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0;

        const cards = Array.from(row.children) as HTMLElement[];
        const N = cards.length;
        if (N > 0) {
          const f = p * (N - 1);
          const cardW = cards[0].offsetWidth || 370;
          const step = cardW + 40;
          const stageW = window.innerWidth;
          row.style.transform = `translateX(${(stageW / 2 - (f * step + cardW / 2)).toFixed(1)}px)`;

          const fi = Math.round(f);
          cards.forEach((c, i) => {
            const dist = Math.abs(i - f);
            const visible = dist <= 1.4;
            if (!visible) {
              c.style.opacity = "0";
              c.style.transform = "scale(0.6)";
              c.style.zIndex = "0";
              c.style.pointerEvents = "none";
              c.classList.remove("front");
              return;
            }
            const scale = (dist < 0.5 ? 1.05 : Math.max(0.58, 1.05 - dist * 0.62)).toFixed(3);
            c.style.transform = `scale(${scale})`;
            c.style.opacity = Math.max(0.45, 1 - dist * 0.52).toFixed(2);
            c.style.pointerEvents = "auto";
            c.style.zIndex = i === fi ? "5" : "1";
            if (i === fi) c.classList.add("front");
            else c.classList.remove("front");
          });

          if (capRef.current) {
            capRef.current.textContent = fi < WS_LIST.length ? WS_LIST[fi].n : "And many more";
          }
          if (barRef.current) {
            barRef.current.style.width = `${(p * 100).toFixed(1)}%`;
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  function scrollToCard(idx: number) {
    const track = trackRef.current;
    const row = rowRef.current;
    if (!track || !row) return;
    const N = row.children.length;
    const range = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: track.offsetTop + (idx / (N - 1)) * range, behavior: "smooth" });
  }

  function handleCardClick(e: React.MouseEvent<HTMLDivElement>, idx: number) {
    if (e.currentTarget.classList.contains("front")) {
      window.location.assign(APP_SIGNUP_URL);
    } else {
      scrollToCard(idx);
    }
  }

  return (
    <section className="mq-track" ref={trackRef}>
      <div className="mq-stage">
        <div className="mq-progress">
          <i ref={barRef as React.RefObject<HTMLElement>} />
        </div>
        <div className="mq-row" ref={rowRef}>
          {WS_LIST.map((ws, i) => {
            const Thumb = ws.Thumb;
            return (
              <div key={ws.n} className="mq-card" onClick={(e) => handleCardClick(e, i)}>
                <div className="mq-head">
                  <div className="mq-num">
                    Workspace {String(i + 1).padStart(2, "0")} / {String(WS_LIST.length).padStart(2, "0")}
                  </div>
                  <h3>{ws.n}</h3>
                  <p>{ws.d}</p>
                </div>
                <div className="mq-shot">
                  <Thumb />
                </div>
              </div>
            );
          })}
          {/* "And many more" card */}
          <div
            className="mq-card mq-more"
            onClick={(e) => {
              const row = rowRef.current;
              if (!row) return;
              const lastIdx = row.children.length - 1;
              if (e.currentTarget.classList.contains("front")) {
                window.location.assign(APP_SIGNUP_URL);
              } else {
                scrollToCard(lastIdx);
              }
            }}
          >
            <div className="mq-more-inner">
              <h3>And many more</h3>
              <p>Screener, IPOs, Watchlist, Insider & 13F, Commentary, Macro & VIX — fourteen connected workspaces in all.</p>
              <div className="mq-go">See everything →</div>
            </div>
            <div className="mq-more-hint">Keep scrolling ↓</div>
          </div>
        </div>
        <div className="mq-cap" ref={capRef}>
          Dashboard
        </div>
        <div className="mq-hint">scroll — or tap a card to open it</div>
      </div>
    </section>
  );
}
