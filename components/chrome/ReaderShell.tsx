"use client";

import { useRef, type ReactNode } from "react";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";
import { useReaderTheme } from "./useReaderTheme";
import { useEtClock, useReveal, useScrollChrome } from "./chrome-hooks";

/**
 * The frame every reading page sits in: themed surface, progress hairline,
 * nav, footer — and the three bits of behaviour that go with them.
 *
 * A client component wrapping server-rendered children, so /about, /faqs and
 * /contact keep their copy in the HTML for crawlers while still getting the
 * light/dark switch and the scroll chrome. The blog does not use it: its board
 * owns state that the shell would have to thread through, so it composes the
 * same hooks directly instead.
 *
 * `active` is optional: /contact is not a nav destination, so it highlights
 * nothing.
 *
 * `data-theme` is set HERE rather than on <html>, so a reader choosing light
 * can't repaint the landing page's dark terminal mock behind their back.
 */
export function ReaderShell({
  active,
  children,
}: {
  active?: "about" | "faqs";
  children: ReactNode;
}) {
  const { theme, toggle } = useReaderTheme();
  const root = useRef<HTMLDivElement>(null);

  useScrollChrome();
  useEtClock();
  useReveal(root);

  return (
    <div className="mc-page" data-theme={theme} ref={root}>
      <div className="mc-prog" aria-hidden="true">
        <i id="mc-prog-bar" />
      </div>

      <SiteNav active={active} theme={theme} onToggleTheme={toggle} />
      {children}
      <SiteFooter />
    </div>
  );
}
