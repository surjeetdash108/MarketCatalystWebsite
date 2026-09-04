"use client";

import { useEffect } from "react";

/**
 * Highlights the current section in the "On this page" overview as the reader
 * scrolls. The nav and the heading ids are already in the server-rendered HTML;
 * this only adds the `.on` active state, so the overview still renders, links
 * and is readable with JavaScript off — it just does not follow the scroll.
 * Renders nothing itself.
 *
 * Computed from scroll position rather than driven by an IntersectionObserver.
 * The observer version only toggled a link when a heading crossed a narrow band
 * (`rootMargin: -88px 0px -70%`, about 180px tall on a laptop), so any movement
 * that skipped the band left NOTHING highlighted: clicking a link in the nav
 * itself, PageDown, a scroll restored on reload, or a jump to an anchor. Reading
 * the positions directly means exactly one entry is always current, whatever
 * brought the reader here.
 */
export function TocSpy() {
  useEffect(() => {
    const heads = Array.from(
      document.querySelectorAll<HTMLElement>(".post-doc h2"),
    ).filter((h) => h.id);
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>(".post-toc a"),
    );
    if (heads.length === 0 || links.length === 0) return;

    /* Tint the rail from the DOCUMENT's own background, not the site's.
       It floats over the post, and posts range from near-white to near-black —
       a fixed grey is invisible on one end or the other. Measured rather than
       taken from the post's data-theme, because a document that never declared
       a theme still has a background, and that is what the reader sees behind
       this text. */
    const toc = document.querySelector<HTMLElement>(".post-toc");
    const doc = document.querySelector<HTMLElement>(".post-doc");
    if (toc && doc) {
      // Walk up from the document for the first ancestor that actually paints;
      // a transparent .post-doc means the page behind it is the real backdrop.
      let el: HTMLElement | null = doc;
      let rgb: number[] | null = null;
      while (el && !rgb) {
        const bg = getComputedStyle(el).backgroundColor;
        const m = /rgba?\(([^)]+)\)/.exec(bg);
        if (m) {
          const parts = m[1].split(",").map((n) => parseFloat(n));
          // alpha 0 = paints nothing; keep looking behind it.
          if (parts.length < 4 || parts[3]! > 0.1) rgb = parts;
        }
        el = el.parentElement;
      }
      if (rgb) {
        // Rec. 709 luma; below half is a dark ground.
        const luma = (0.2126 * rgb[0]! + 0.7152 * rgb[1]! + 0.0722 * rgb[2]!) / 255;
        toc.classList.toggle("on-dark", luma < 0.5);
      }
    }

    // Just below the site's sticky header — a heading is "current" once it has
    // scrolled up to about where the reader is actually looking.
    const LINE = 120;
    let raf = 0;

    const update = () => {
      raf = 0;
      // querySelectorAll returns document order, so the last heading above the
      // line is the section being read. Before the first one, the first is.
      let current = heads[0]!;
      for (const h of heads) {
        if (h.getBoundingClientRect().top <= LINE) current = h;
        else break;
      }
      const href = `#${current.id}`;
      for (const a of links) a.classList.toggle("on", a.getAttribute("href") === href);
    };

    // rAF-throttled: scroll fires far more often than the screen repaints, and
    // this reads layout, which is the expensive half.
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
