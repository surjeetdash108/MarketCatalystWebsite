"use client";

import { useEffect } from "react";

// ============================================================
// LANDING PAGE CHOREOGRAPHY
// ============================================================
// One client component owns every piece of motion on the page so the
// sections themselves can stay server-rendered:
//
//   1. intro loader (counts to 100 as the page loads, then wipes up)
//      + hero reveal
//   2. the hero product shot, scaled to fit and revealed under a
//      cursor-tracked spotlight (static strip on touch devices)
//   3. ET clock, counters, in-view reveals, coverage spotlight
//   4. scroll choreography: nav state, progress bar, sticky panel
//      stacking, workspace index, velocity-driven ticker tape
//
// It renders only the loader + progress chrome; everything else is
// driven through the DOM by id/data-attribute.

/* Stacking needs a viewport tall enough to see a card pinned against the one
   sliding over it. Below this — a phone held in landscape, essentially — the
   panels stay an ordinary vertical list. app/home.css matches this number. */
const STACK_MIN_HEIGHT = 420;

export function HomeMotion() {
  useEffect(() => {
    const d = document;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    const timers: ReturnType<typeof setTimeout>[] = [];
    const cleanups: (() => void)[] = [];

    // ── 1. intro + hero reveal ──────────────────────────────
    const masks = Array.from(d.querySelectorAll<HTMLElement>("[data-mask]"));
    const fades = Array.from(d.querySelectorAll<HTMLElement>("[data-fade]"));
    const heroFades = fades.filter((el) => el.closest(".mc-hero"));

    const revealHero = () => {
      masks.forEach((m) => {
        const delay = reduce ? 0 : Number(m.dataset.mask ?? 0);
        timers.push(setTimeout(() => m.classList.add("is-in"), delay));
      });
      heroFades.forEach((el) => {
        const delay = reduce ? 0 : Number(el.dataset.fade ?? 0);
        timers.push(setTimeout(() => el.classList.add("is-in"), delay));
      });
    };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      revealHero();
    };

    // Intro 0-100 loader commented out for now: show homepage directly
    finish();
    /*
    if (reduce) {
      finish();
    } else {
      const readTriple = (name: string) => {
        const raw = getComputedStyle(d.documentElement).getPropertyValue(name).trim();
        const parts = raw.split(/[\s,]+/).map(Number);
        return parts.length === 3 && parts.every((n) => Number.isFinite(n)) ? parts : null;
      };
      const from = readTriple("--mc-down-rgb");
      const to = readTriple("--mc-up-rgb");

      const MIN_MS = 400;
      const MAX_MS = 3000;
      const WAIT_CEIL = 0.9;
      const WAIT_TAU = 700;
      const OUTRO_MS = 250;

      let ready = false;
      const heroImg = d.querySelector<HTMLImageElement>("#mc-dash img");
      const fontsReady = d.fonts?.ready ?? Promise.resolve();
      const heroReady = heroImg ? heroImg.decode().catch(() => undefined) : Promise.resolve();
      Promise.all([fontsReady, heroReady]).then(() => {
        ready = true;
      });

      const t0 = performance.now();
      let outroFrom = 0;
      let outroT0 = -1;
      const paint = (e: number) => {
        if (countRef.current) {
          countRef.current.textContent = String(Math.round(e * 100)).padStart(3, "0");
          if (from && to) {
            const mix = from.map((c, i) => Math.round(c + (to[i] - c) * e));
            countRef.current.style.color = `rgb(${mix.join(" ")})`;
          }
        }
        if (wordRef.current) {
          const s2 = wordRef.current.style;
          s2.setProperty("--mc-word-blur", `${(1 - e) * 16}px`);
          s2.setProperty("--mc-word-fade", String(0.25 + e * 0.75));
          s2.setProperty("--mc-tag-fade", String(clamp01((e - 0.15) / 0.85)));
        }
        if (bgRef.current) {
          const s3 = bgRef.current.style;
          s3.setProperty("--mc-bg-blur", `${5 + (1 - e) * 30}px`);
          s3.setProperty("--mc-bg-fade", String(0.14 + e * 0.5));
        }
      };
      const tick = (t: number) => {
        const elapsed = t - t0;
        if (outroT0 < 0) {
          const e = WAIT_CEIL * (1 - Math.exp(-elapsed / WAIT_TAU));
          paint(e);
          if ((ready && elapsed >= MIN_MS) || elapsed >= MAX_MS) {
            outroFrom = e;
            outroT0 = t;
          }
          raf.current = requestAnimationFrame(tick);
          return;
        }
        const q = clamp01((t - outroT0) / OUTRO_MS);
        paint(outroFrom + (1 - outroFrom) * (1 - Math.pow(1 - q, 2)));
        if (q < 1) raf.current = requestAnimationFrame(tick);
        else timers.push(setTimeout(finish, 150));
      };
      raf.current = requestAnimationFrame(tick);
      timers.push(setTimeout(finish, MAX_MS + OUTRO_MS + 400));
    }
    */

    // ── 2. hero spotlight (cursor, or finger on touch) ─────────────
    // The backdrop used to be a DOM mock that had to be measured and
    // transform-fitted to the stage on every resize. It is a photograph now,
    // so `object-fit: cover` in app/home.css does that job and the fit pass is
    // gone — this block only drives the reveal.
    const hero = d.querySelector<HTMLElement>(".mc-hero");
    const dash = d.getElementById("mc-dash");
    const veil = d.getElementById("mc-veil");

    if (dash && hero) {
      /* A cursor hovers; a finger does not. So on a touch screen the reveal is
         bound to the one gesture that exists there - press and drag - and
         released on lift. Same mask, same easing, same blur; only the trigger
         differs. The radius is smaller because it is a fraction of a phone,
         not of a laptop. */
      const fine = window.matchMedia("(pointer: fine)").matches;
      const RADIUS = fine ? 680 : 430;
      let pressed = false;
      let hx = 0;
      let hy = 0;
      let tx = 0;
      let ty = 0;
      let on = false;
      let r2 = 0;
      let target = 0;
      let spotRaf = 0;

      /* Two separate things, easy to confuse: how MUCH is revealed, and how
         far the reveal takes to die out.

         The lit core is deliberately small - opacity is already halved by a
         quarter of the radius - so only a modest patch of the photograph
         reads clearly. Everything beyond it is tail: five more stops carrying
         a faint wash out to the full radius, so the reveal dissolves instead
         of ending. An earlier version held full opacity to 52% and stopped at
         88%, which lit far more and still showed a rim.

         Shrink the core by moving the 10%/22% stops down; lengthen the spread
         by raising RADIUS. They are independent. */
      const paint = () => {
        const g = `radial-gradient(circle ${r2.toFixed(0)}px at ${hx.toFixed(0)}px ${hy.toFixed(
          0,
        )}px, #000 0%, #000 12%, rgba(0,0,0,0.82) 24%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.26) 58%, rgba(0,0,0,0.08) 80%, transparent 100%)`;
        dash.style.maskImage = g;
        dash.style.setProperty("-webkit-mask-image", g);
      };

      const onMove = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect();
        tx = e.clientX - r.left;
        ty = e.clientY - r.top;
        if (!on) {
          on = true;
          hx = tx;
          hy = ty;
          dash.style.opacity = "1";
          if (veil) veil.style.opacity = "0.22";
        }
        target = RADIUS;
        startSpot();
      };
      const onLeave = () => {
        target = 0;
        on = false;
        dash.style.opacity = "0";
        if (veil) veil.style.opacity = "1";
      };

      /* All passive: the spotlight never calls preventDefault, so dragging
         across the hero still scrolls the page as it should.

         That scroll is also why the reveal LINGERS on touch instead of
         releasing on lift. The moment the browser decides a drag is a scroll
         it fires pointercancel and stops sending moves, so a release-on-lift
         reveal blinks out the instant you try to look at it. Holding it for a
         beat afterwards also makes a plain tap worth something, which is the
         gesture most people will try first. */
      const LINGER_MS = 1600;
      let hideTimer: ReturnType<typeof setTimeout> | null = null;
      const cancelHide = () => {
        if (hideTimer) clearTimeout(hideTimer);
        hideTimer = null;
      };
      const onDown = (e: PointerEvent) => { pressed = true; cancelHide(); onMove(e); };
      const onUp = () => {
        pressed = false;
        cancelHide();
        hideTimer = setTimeout(onLeave, LINGER_MS);
      };
      const onDrag = (e: PointerEvent) => { if (pressed) onMove(e); };

      if (fine) {
        hero.addEventListener("pointermove", onMove, { passive: true });
        hero.addEventListener("pointerleave", onLeave);
      } else {
        hero.addEventListener("pointerdown", onDown, { passive: true });
        hero.addEventListener("pointermove", onDrag, { passive: true });
        hero.addEventListener("pointerup", onUp, { passive: true });
        hero.addEventListener("pointercancel", onUp, { passive: true });
      }

      let spotActive = false;
      const loop = () => {
        hx += (tx - hx) * 0.16;
        hy += (ty - hy) * 0.16;
        r2 += (target - r2) * 0.12;
        if (r2 > 0.5) paint();
        if (target > 0 || r2 > 0.5) {
          spotRaf = requestAnimationFrame(loop);
        } else {
          spotActive = false;
        }
      };

      const startSpot = () => {
        if (!spotActive) {
          spotActive = true;
          spotRaf = requestAnimationFrame(loop);
        }
      };

      cleanups.push(() => {
        cancelAnimationFrame(spotRaf);
        cancelHide();
        hero.removeEventListener("pointermove", onMove);
        hero.removeEventListener("pointerleave", onLeave);
        hero.removeEventListener("pointerdown", onDown);
        hero.removeEventListener("pointermove", onDrag);
        hero.removeEventListener("pointerup", onUp);
        hero.removeEventListener("pointercancel", onUp);
      });
    }

    // ── 3a. ET clock ────────────────────────────────────────
    const clock = d.getElementById("mc-clock");
    const setClock = () => {
      if (!clock) return;
      clock.textContent = `${new Date().toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour12: false,
      })} ET`;
    };
    setClock();
    const clockId = setInterval(setClock, 1000);
    cleanups.push(() => clearInterval(clockId));

    // ── 3b. HUD drift (opt-in per cell via data-drift="1") ──
    const drifters = Array.from(d.querySelectorAll<HTMLElement>("[data-drift]")).filter(
      (el) => el.dataset.drift === "1",
    );
    let driftId: ReturnType<typeof setInterval> | null = null;
    if (drifters.length && !reduce) {
      driftId = setInterval(() => {
        drifters.forEach((el) => {
          const txt = (el.textContent ?? "").replace(/,/g, "");
          const num = parseFloat(txt);
          if (Number.isNaN(num)) return;
          const pct = txt.includes("%");
          const next = num + (Math.random() - 0.48) * (pct ? 0.4 : num > 1000 ? 3.5 : 0.09);
          el.textContent = pct
            ? `${next.toFixed(0)}%`
            : num > 1000
              ? next.toLocaleString("en-US", { maximumFractionDigits: 0 })
              : next.toFixed(1);
        });
      }, 1900);
      cleanups.push(() => {
        if (driftId) clearInterval(driftId);
      });
    }

    // ── 3c. counters ────────────────────────────────────────
    const counterIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseFloat(el.dataset.count ?? "0") || 0;
          const t0 = performance.now();
          const step = (t: number) => {
            const p = clamp01((t - t0) / 1500);
            const e = 1 - Math.pow(1 - p, 3);
            el.textContent = String(Math.round(target * e));
            if (p < 1) requestAnimationFrame(step);
          };
          if (reduce) el.textContent = String(target);
          else requestAnimationFrame(step);
          counterIo.unobserve(el);
        });
      },
      { threshold: 0.5 },
    );
    d.querySelectorAll("[data-count]").forEach((el) => counterIo.observe(el));
    cleanups.push(() => counterIo.disconnect());

    // ── 3d. below-the-fold reveals ──────────────────────────
    const revealIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const delay = reduce ? 0 : Number(el.dataset.fade ?? 0);
          timers.push(setTimeout(() => el.classList.add("is-in"), delay));
          revealIo.unobserve(el);
        });
      },
      { threshold: 0.3 },
    );
    fades.filter((el) => !el.closest(".mc-hero")).forEach((el) => revealIo.observe(el));
    cleanups.push(() => revealIo.disconnect());

    // ── 3e. coverage spotlight ──────────────────────────────
    const spot = d.getElementById("mc-spot");
    const coverage = d.getElementById("mc-coverage");
    if (spot && coverage) {
      const onMove = (e: PointerEvent) => {
        const r = coverage.getBoundingClientRect();
        spot.style.opacity = "1";
        spot.style.transform = `translate3d(${e.clientX - r.left - 310}px, ${e.clientY - r.top - 310}px, 0)`;
      };
      const onLeave = () => {
        spot.style.opacity = "0";
      };
      coverage.addEventListener("pointermove", onMove, { passive: true });
      coverage.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        coverage.removeEventListener("pointermove", onMove);
        coverage.removeEventListener("pointerleave", onLeave);
      });
    }

    // ── 4. scroll choreography ──────────────────────────────
    const nav = d.getElementById("mc-nav");
    const prog = d.getElementById("mc-prog-bar");
    const panels = Array.from(d.querySelectorAll<HTMLElement>("[data-panel]"));
    const stackIdx = d.getElementById("mc-stack-idx");
    const tapeEl = d.getElementById("mc-tape");

    let tapeX = 0;
    let tapeHalf = 0;
    const updateTapeHalf = () => {
      tapeHalf = tapeEl && !reduce ? tapeEl.scrollWidth / 2 : 0;
    };
    updateTapeHalf();

    let lastY = window.scrollY;
    let vel = 0;
    let geo: { top: number; h: number }[] | null = null;

    const measureGeo = () => {
      const vh = window.innerHeight;
      const stacking = vh >= STACK_MIN_HEIGHT;
      if (!panels.length || !stacking) {
        geo = null;
        panels.forEach((p) => {
          p.style.transform = "";
          p.style.filter = "";
          p.style.position = "";
          p.style.top = "";
        });
        return;
      }

      // If at top of page, no panels are stuck, so avoid forced style invalidation
      if (window.scrollY === 0) {
        geo = panels.map((p) => ({
          top: p.getBoundingClientRect().top,
          h: p.offsetHeight,
        }));
      } else {
        const saved = panels.map((p) => [p.style.position, p.style.transform] as const);
        panels.forEach((p) => {
          p.style.position = "static";
          p.style.transform = "none";
        });
        geo = panels.map((p) => ({
          top: p.getBoundingClientRect().top + window.scrollY,
          h: p.offsetHeight,
        }));
        panels.forEach((p, i) => {
          p.style.position = saved[i][0] || "sticky";
          p.style.transform = saved[i][1];
        });
      }

      const stickTop = vh * 0.12;
      panels.forEach((p, i) => {
        const h = geo?.[i].h ?? 0;
        const fits = h <= vh - stickTop;
        p.style.top = `${Math.round(fits ? stickTop : Math.min(stickTop, vh - h - 12))}px`;
      });
    };

    // Defer initial measurement off the main hydration thread to avoid blocking tasks
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => measureGeo());
    } else {
      setTimeout(measureGeo, 100);
    }

    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      const docH = d.documentElement.scrollHeight;

      vel = y - lastY;
      lastY = y;

      if (prog) {
        const h = docH - vh;
        prog.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
      }
      if (nav) nav.classList.toggle("is-stuck", y > 40);

      const stacking = vh >= STACK_MIN_HEIGHT;
      if (panels.length && stacking && geo) {
        panels.forEach((p, i) => {
          const next = geo?.[i + 1];
          if (!next) {
            p.style.transform = "none";
            p.style.filter = "none";
            return;
          }
          const stick = vh * 0.12;
          const overlap = clamp01((y + vh - next.top) / Math.max(1, vh - stick));
          p.style.transform = `scale(${(1 - overlap * 0.05).toFixed(4)}) translateY(${(-overlap * 18).toFixed(1)}px)`;
          p.style.filter = `brightness(${(1 - overlap * 0.3).toFixed(3)})`;
        });

        if (stackIdx) {
          let active = 0;
          panels.forEach((p, i) => {
            const top = p.getBoundingClientRect().top;
            if (top <= vh * 0.2) active = i;
          });
          stackIdx.textContent = `${String(active + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
        }
      }
    };

    // Dedicated lightweight ticker loop: ONLY moves tape horizontally on GPU when visible
    let tickerRaf = 0;
    let isTapeVisible = false;
    const tickTape = () => {
      if (!isTapeVisible) {
        tickerRaf = 0;
        return;
      }
      if (tapeEl && !reduce) {
        tapeX -= 0.38 + vel * 0.12;
        if (tapeHalf) {
          if (tapeX <= -tapeHalf) tapeX += tapeHalf;
          if (tapeX > 0) tapeX -= tapeHalf;
        }
        tapeEl.style.transform = `translate3d(${tapeX.toFixed(1)}px, 0, 0) skewY(${(-vel * 0.016).toFixed(2)}deg)`;
        if (vel !== 0) vel *= 0.86;
      }
      tickerRaf = requestAnimationFrame(tickTape);
    };

    if (tapeEl && !reduce) {
      const tapeIo = new IntersectionObserver(([entry]) => {
        isTapeVisible = entry.isIntersecting;
        if (isTapeVisible && !tickerRaf) {
          tickerRaf = requestAnimationFrame(tickTape);
        }
      });
      tapeIo.observe(tapeEl);
      cleanups.push(() => tapeIo.disconnect());
    }

    let scrollRaf = 0;
    const handleScroll = () => {
      if (!scrollRaf) {
        scrollRaf = requestAnimationFrame(() => {
          onScroll();
          scrollRaf = 0;
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      updateTapeHalf();
      measureGeo();
      onScroll();
    };
    window.addEventListener("resize", handleResize);

    cleanups.push(() => {
      cancelAnimationFrame(tickerRaf);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    });

    return () => {
      timers.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      {/* Intro 0-100 loader commented out for now:
      <div className="mc-loader" ref={loaderRef} aria-hidden="true">
        <div className="mc-loader-bg" ref={bgRef} aria-hidden="true">
          <picture>
            <source
              type="image/webp"
              srcSet="/prelanding-640.webp 640w, /prelanding-1280.webp 1280w"
              sizes="max(100vw, 178vh)"
            />
            <img src="/prelanding-1280.jpg" alt="" fetchPriority="high" decoding="async" />
          </picture>
        </div>
        <div className="mc-loader-scrim" aria-hidden="true" />
        <div className="mc-loader-centre" ref={wordRef}>
          <div className="mc-loader-word">
            <span>Market</span>
            <b>Catalyst</b>
          </div>
          <p className="mc-loader-tag">
            Stock Market Research Platform, <em>powered by AI</em>
          </p>
        </div>
        <div className="mc-loader-status">Establishing session.</div>
        <div className="mc-loader-count" ref={countRef}>
          000
        </div>
      </div>
      */}
      <div className="mc-prog" aria-hidden="true">
        <i id="mc-prog-bar" />
      </div>
    </>
  );
}
