"use client";

import { useEffect } from "react";

/**
 * Highlights the current section in the "On this page" nav as the reader
 * scrolls. The TOC list and the heading ids are already in the server-rendered
 * HTML; this only adds the `.on` active state (same IntersectionObserver the v2
 * template used). Renders nothing.
 */
export function TocSpy() {
  useEffect(() => {
    const heads = Array.from(document.querySelectorAll<HTMLElement>("#postBody h2"));
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".toc a"));
    if (!("IntersectionObserver" in window) || heads.length === 0 || links.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).id;
          links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === `#${id}`));
        });
      },
      { rootMargin: "-88px 0px -70% 0px" },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, []);

  return null;
}
