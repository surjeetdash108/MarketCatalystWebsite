"use client";

import { useEffect, useRef } from "react";

// ============================================================
// LANDING PAGE CHOREOGRAPHY
// ============================================================
// One client component owns every piece of motion on the page so the
// sections themselves can stay server-rendered:
//
//   1. intro loader (count to 100, then wipe up) + hero reveal
//   2. the hero product shot, scaled to fit and revealed under a
//      cursor-tracked spotlight (static strip on touch devices)
//   3. ET clock, counters, in-view reveals, coverage spotlight
//   4. scroll choreography: nav state, progress bar, sticky panel
//      stacking, workspace index, velocity-driven ticker tape
//
// It renders only the loader + progress chrome; everything else is
// driven through the DOM by id/data-attribute.

const DASH_W = 1440;
const DASH_H = 900;
/* Below this width the panels stop being sticky (see app/home.css), so the
   stacking transforms are skipped too. */
const STACK_MIN_WIDTH = 861;

export function HomeMotion() {
  // Driven straight through the DOM rather than React state: the intro counter
  // ticks once per frame, and re-rendering the tree 60x a second for it would
  // be pure waste.
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const countRef = useRef<HTMLDivElement | null>(null);
  const raf = useRef<number | null>(null);

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
      loaderRef.current?.classList.add("is-out");
      revealHero();
    };

    if (reduce) {
      finish();
    } else {
      const t0 = performance.now();
      const dur = 1500;
      const tick = (t: number) => {
        const p = clamp01((t - t0) / dur);
        const e = 1 - Math.pow(1 - p, 2);
        if (countRef.current) countRef.current.textContent = String(Math.round(e * 100)).padStart(3, "0");
        if (p < 1) raf.current = requestAnimationFrame(tick);
        else timers.push(setTimeout(finish, 180));
      };
      raf.current = requestAnimationFrame(tick);
      // Never trap the page behind the loader if a frame never lands.
      timers.push(setTimeout(finish, 4200));
    }

    // ── 2. product shot: scale to fit ───────────────────────
    const hero = d.querySelector<HTMLElement>(".mc-hero");
    const dash = d.getElementById("mc-dash");
    const veil = d.getElementById("mc-veil");
    const dashInner = dash?.querySelector<HTMLElement>(".mcd") ?? null;

    const fit = () => {
      if (hero && dashInner) {
        const r = hero.getBoundingClientRect();
        /* Two fits, because the hero is a different shape on each.
           On a laptop it is a wide 100vh stage and the mock is CONTAINED in
           it, whole, sitting below the nav. On a phone the hero is a tall
           column — containing a 16:10 mock there leaves a small panel adrift
           in the middle of a very tall box, which is exactly the "separate
           image" look this is meant to stop. So on touch it COVERS instead,
           cropped and centred like any background image. */
        const cover = !window.matchMedia("(pointer: fine)").matches;
        const s = cover
          ? Math.max(r.width / DASH_W, r.height / DASH_H)
          : Math.min(r.width / DASH_W, (r.height - 110) / DASH_H);
        const ox = (r.width - DASH_W * s) / 2;
        const oy = cover
          ? (r.height - DASH_H * s) / 2
          : Math.max(96, (r.height - DASH_H * s) / 2 + 52);
        dashInner.style.transform = `translate(${ox.toFixed(1)}px, ${oy.toFixed(1)}px) scale(${s.toFixed(4)})`;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    cleanups.push(() => window.removeEventListener("resize", fit));

    // ── 2b. hero spotlight (cursor, or finger on touch) ─────────────
    if (dash && hero) {
      /* A cursor hovers; a finger does not. So on a touch screen the reveal is
         bound to the one gesture that exists there - press and drag - and
         released on lift. Same mask, same easing, same blur; only the trigger
         differs. The radius is smaller because it is a fraction of a phone,
         not of a laptop. */
      const fine = window.matchMedia("(pointer: fine)").matches;
      const RADIUS = fine ? 430 : 300;
      let pressed = false;
      let hx = 0;
      let hy = 0;
      let tx = 0;
      let ty = 0;
      let on = false;
      let r2 = 0;
      let target = 0;
      let spotRaf = 0;

      const paint = () => {
        const g = `radial-gradient(circle ${r2.toFixed(0)}px at ${hx.toFixed(0)}px ${hy.toFixed(
          0,
        )}px, #000 52%, rgba(0,0,0,0.6) 72%, transparent 88%)`;
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
          if (veil) veil.style.opacity = "0.45";
        }
        target = RADIUS;
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

      const loop = () => {
        hx += (tx - hx) * 0.16;
        hy += (ty - hy) * 0.16;
        r2 += (target - r2) * 0.12;
        if (r2 > 0.5) paint();
        spotRaf = requestAnimationFrame(loop);
      };
      loop();

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
    let lastY = window.scrollY;
    let vel = 0;
    let geo: { top: number; h: number }[] | null = null;
    let geoKey = "";

    const onScroll = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      vel = y - lastY;
      lastY = y;

      if (prog) {
        const h = d.documentElement.scrollHeight - vh;
        prog.style.width = `${h > 0 ? (y / h) * 100 : 0}%`;
      }
      if (nav) nav.classList.toggle("is-stuck", y > 40);

      const stacking = window.innerWidth >= STACK_MIN_WIDTH;
      if (panels.length && stacking) {
        // Sticky panels report their stuck position, so measure them once per
        // layout with position:static to get their true document offsets.
        const key = `${window.innerWidth}x${vh}x${d.documentElement.scrollHeight}`;
        if (!geo || geoKey !== key) {
          geoKey = key;
          const saved = panels.map((p) => [p.style.position, p.style.transform] as const);
          panels.forEach((p) => {
            p.style.position = "static";
            p.style.transform = "none";
          });
          geo = panels.map((p) => ({ top: p.getBoundingClientRect().top + window.scrollY, h: p.offsetHeight }));
          panels.forEach((p, i) => {
            p.style.position = saved[i][0] || "sticky";
            p.style.transform = saved[i][1];
          });
        }
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
      } else if (panels.length) {
        // Below the sticky breakpoint: drop every inline override so the
        // stylesheet's plain vertical list takes over cleanly.
        geo = null;
        panels.forEach((p) => {
          p.style.transform = "";
          p.style.filter = "";
          p.style.position = "";
        });
      }

      if (stackIdx && panels.length) {
        let active = 0;
        panels.forEach((p, i) => {
          if (p.getBoundingClientRect().top <= vh * 0.2) active = i;
        });
        stackIdx.textContent = `${String(active + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
      }

      if (tapeEl && !reduce) {
        tapeX -= 0.38 + vel * 0.12;
        const half = tapeEl.scrollWidth / 2;
        if (half) {
          if (tapeX <= -half) tapeX += half;
          if (tapeX > 0) tapeX -= half;
        }
        tapeEl.style.transform = `translate3d(${tapeX.toFixed(1)}px, 0, 0) skewY(${(-vel * 0.016).toFixed(2)}deg)`;
      }
    };

    let loopRaf = 0;
    const loop = () => {
      onScroll();
      if (!reduce) vel *= 0.86;
      loopRaf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      cancelAnimationFrame(loopRaf);
      window.removeEventListener("resize", onScroll);
    });

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      timers.forEach(clearTimeout);
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return (
    <>
      <div className="mc-loader" ref={loaderRef} aria-hidden="true">
        <div className="mc-loader-meta">
          <div>MarketCatalyst</div>
          <span>Establishing session</span>
        </div>
        <div className="mc-loader-count" ref={countRef}>
          000
        </div>
      </div>
      <div className="mc-prog" aria-hidden="true">
        <i id="mc-prog-bar" />
      </div>
    </>
  );
}
