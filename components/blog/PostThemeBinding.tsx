"use client";

import { useEffect } from "react";

/**
 * Keeps an authored post's `data-theme` in step with the reader's own choice.
 *
 * These designs put EVERY colour in `html[data-theme="light"]` and
 * `html[data-theme="dark"]` blocks, with no unqualified fallback — so the
 * attribute is not decoration, it is the difference between a styled page and
 * 122 `var(--…)` references resolving to nothing. The document carries it on
 * its own <html>, which the site does not keep, and the attribute went missing.
 *
 * The server already renders one (see PostHtmlDoc) so the page is styled before
 * any script runs and with scripting off entirely. This only re-points it when
 * the reader flips the site's own light/dark toggle, so a post follows the
 * theme of the page it is on instead of being frozen at whatever the file was
 * saved with.
 *
 * Rendered ONLY for a post whose stylesheet actually defines both themes —
 * forcing `data-theme="dark"` onto a design that never wrote a dark block would
 * change nothing, or worse, match a half-finished one.
 */
export function PostThemeBinding({ targetId }: { targetId: string }) {
  /* Always light. The shell's article region is a light scope (see
     article-shell.tsx): these designs are drawn on white and most carry no
     usable dark block, so pointing them at the site's dark theme leaves
     `var(--...)` references resolving to nothing. The previous shell reached
     the same result by hardcoding light and never rendering a toggle here. */
  const theme = "light";
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (el) el.dataset.theme = theme;
  }, [targetId, theme]);
  return null;
}
