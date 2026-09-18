"use client";

import { useEffect, useRef, type RefObject } from "react";

/** New York, always — see the note on date formatting in BlogIndex. */
const ET = "America/New_York";

/**
 * The scroll-progress hairline and the nav's stuck state.
 *
 * Both are pure DOM writes on a passive scroll listener rather than React
 * state: they fire on every frame of a scroll, and re-rendering a page for
 * them would be a waste of the main thread.
 */
export function useScrollChrome() {
  useEffect(() => {
    const nav = document.getElementById("mc-nav");
    const bar = document.getElementById("mc-prog-bar");

    const onScroll = () => {
      const y = window.scrollY;
      if (bar) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = `${h > 0 ? Math.min(100, (y / h) * 100) : 0}%`;
      }
      nav?.classList.toggle("is-stuck", y > 40);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

/** Fills the footer's #mc-clock once a second, in market time. */
export function useEtClock() {
  useEffect(() => {
    const tick = () => {
      const el = document.getElementById("mc-clock");
      if (el) {
        el.textContent = `${new Date().toLocaleTimeString("en-US", { timeZone: ET, hour12: false })} ET`;
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
}

/**
 * Fade-and-rise anything carrying `.mc-rev` as it comes into view.
 *
 * The second effect has NO dependency list on purpose: on a page whose content
 * changes — search results arriving, a filter narrowing the list — the cards
 * that appear also need watching. Re-observing an element already being
 * watched is a no-op, so the cost of running it every render is nil.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  const io = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const delay = Number(el.dataset.delay ?? 0);
          window.setTimeout(() => el.classList.add("is-in"), reduce ? 0 : delay);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.current = obs;
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const obs = io.current;
    const el = root.current;
    if (!obs || !el) return;
    el.querySelectorAll<HTMLElement>(".mc-rev:not(.is-in)").forEach((n) => obs.observe(n));
  });
}
