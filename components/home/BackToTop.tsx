"use client";

import { useEffect, useRef, useState } from "react";

/** Deep red at the very bottom of the page. */
const RED: [number, number, number] = [220, 38, 38];
/** Halfway stop - the app's Money Flow amber - so the blend never goes muddy brown. */
const AMBER: [number, number, number] = [224, 187, 94];
/** Fallback green if --mc-up-rgb can't be read; matches theme.css dark. */
const GREEN_FALLBACK: [number, number, number] = [74, 222, 128];
/** Shown once the reader is this far (in viewports) below the top. */
const SHOW_AFTER = 0.6;

/**
 * Back-to-top button drawn as a candlestick with an arrowhead for its upper
 * wick. Its colour tracks scroll depth like a price: deep red at the bottom of
 * the page, through amber, to the site green as the reader climbs back up.
 */
export function BackToTop() {
  const ref = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const raw = getComputedStyle(el).getPropertyValue("--mc-up-rgb").trim().split(/\s+/).map(Number);
    const green = raw.length === 3 && raw.every((n) => Number.isFinite(n))
      ? (raw as [number, number, number])
      : GREEN_FALLBACK;

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const [from, to, t] = p < 0.5 ? [green, AMBER, p * 2] : [AMBER, RED, (p - 0.5) * 2];
      const c = from.map((f, i) => Math.round(f + (to[i] - f) * t));
      el.style.setProperty("--mc-ttc", c.join(" "));
      setShown(window.scrollY > window.innerHeight * SHOW_AFTER);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      ref={ref}
      type="button"
      className={`mc-totop${shown ? " is-shown" : ""}`}
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={shown ? 0 : -1}
    >
      <svg viewBox="0 0 24 44" aria-hidden="true">
        {/* Arrowhead as the upper wick */}
        <path d="M12 2 L5 11 H19 Z" />
        <rect x="11" y="11" width="2" height="5" rx="1" />
        {/* Candle body */}
        <rect x="6.5" y="16" width="11" height="17" rx="2" />
        {/* Lower wick */}
        <rect x="11" y="33" width="2" height="8" rx="1" />
      </svg>
    </button>
  );
}
