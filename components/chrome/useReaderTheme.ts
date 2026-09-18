"use client";

import { useCallback, useSyncExternalStore } from "react";

/* ── The reader's theme ───────────────────────────────────────────────────
   localStorage IS the store, subscribed to rather than copied into state.
   Three things fall out of that for free: no setState-in-an-effect on mount
   (and so no extra render), a switch flipped in one tab reaching every other
   tab, and — because the key is shared — a choice made on the blog still
   standing when the reader opens About or the FAQs.

   The server snapshot is "dark" deliberately. The reader has usually just come
   from a landing page that is a dark terminal, and flipping the site to paper
   between one click and the next reads as a different site.

   Only the reading pages (blog, about, faqs) offer the switch. The landing
   page stays dark: its product mock IS a dark terminal, and a paper version of
   it would be a picture of a different product.                            */

export type Theme = "light" | "dark";

const KEY = "mc-theme";
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  // `storage` only fires for OTHER tabs, which is exactly the gap the local
  // listener set fills.
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function readTheme(): Theme {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "dark";
  } catch {
    return "dark";
  }
}

function writeTheme(next: Theme) {
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* storage disabled — the choice just won't outlive the visit */
  }
  for (const fn of listeners) fn();
}

/** The current theme, and a toggle. Safe to call from any client component. */
export function useReaderTheme(): { theme: Theme; toggle: () => void } {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "dark" as Theme);
  const toggle = useCallback(() => writeTheme(readTheme() === "dark" ? "light" : "dark"), []);
  return { theme, toggle };
}
