"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { APP_LOGIN_URL, APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { BrandMark } from "./BrandMark";
import type { Theme } from "./useReaderTheme";

/**
 * The site nav, worn by every mc-* page.
 *
 * Only real destinations. The reference design also carried "Workspaces" and
 * "Pricing", but those are sections of the landing page rather than pages of
 * their own — in a nav shown on four routes they would be links to nowhere.
 *
 * The light/dark switch renders only when a page passes one in. The reading
 * pages (blog, about, faqs) do; the landing page does not, because its product
 * mock is a dark terminal and a paper version of it would be a picture of a
 * different product.
 *
 * `.is-stuck` is toggled on scroll — by HomeMotion on `/`, by useScrollChrome
 * everywhere else. Styling lives in app/chrome.css.
 */
export function SiteNav({
  active,
  theme,
  onToggleTheme,
}: {
  active?: "about" | "blogs" | "faqs";
  theme?: Theme;
  onToggleTheme?: () => void;
}) {
  const [open, setOpen] = useState(false);

  // Close on Escape, and never leave the drawer open behind a desktop layout
  // if the viewport is widened while it is showing.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 860) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const close = () => setOpen(false);
  const cls = (id: "about" | "blogs" | "faqs") =>
    `mc-navlink${active === id ? " is-active" : ""}`;
  const current = (id: "about" | "blogs" | "faqs") =>
    active === id ? ("page" as const) : undefined;

  const toDark = theme === "light";

  return (
    <header className="mc-nav" id="mc-nav">
      <Link href="/" className="mc-brand" onClick={close}>
        <BrandMark />
      </Link>

      <nav className={`mc-nav-links${open ? " is-open" : ""}`} id="mc-nav-links">
        <Link className={cls("about")} href="/about" onClick={close} aria-current={current("about")}>
          About us
        </Link>
        <Link className={cls("blogs")} href="/posts" onClick={close} aria-current={current("blogs")}>
          Blogs
        </Link>
        <Link className={cls("faqs")} href="/faqs" onClick={close} aria-current={current("faqs")}>
          FAQs
        </Link>
        <a className="mc-navlink-ghost" href={APP_LOGIN_URL} onClick={close}>
          Log in
        </a>

        {onToggleTheme && (
          <button
            type="button"
            className="mc-theme"
            onClick={onToggleTheme}
            aria-label={toDark ? "Switch to dark theme" : "Switch to light theme"}
            title={toDark ? "Dark mode" : "Light mode"}
          >
            {toDark ? (
              /* currently light → offer the moon */
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 14.5A8.2 8.2 0 0 1 9.6 4 8.4 8.4 0 1 0 20 14.5z" />
              </svg>
            ) : (
              /* currently dark → offer the sun */
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" />
                <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
              </svg>
            )}
            {/* Shown only inside the mobile drawer, where a bare icon on a
                full-width row would read as a mystery button. */}
            <span className="mc-theme-t">{toDark ? "Dark mode" : "Light mode"}</span>
          </button>
        )}

        <a className="mc-navlink-solid" href={APP_SIGNUP_URL} onClick={close}>
          Sign up
        </a>
      </nav>

      <button
        type="button"
        className={`mc-burger${open ? " is-open" : ""}`}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls="mc-nav-links"
        onClick={() => setOpen((v) => !v)}
      >
        <span />
      </button>
    </header>
  );
}
