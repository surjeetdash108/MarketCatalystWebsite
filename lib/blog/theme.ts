import "server-only";
import { adminFirestore } from "@/lib/firebase/admin";
import { DEFAULT_BLOG_CSS } from "./default-theme";

/**
 * The blog's shared design, written by the admin service when a document is
 * uploaded (see extractTheme / saveTheme in the backend).
 *
 * One document for the whole blog, not one per post: every authored post is
 * written against the same stylesheet, and a copy per post meant a design
 * change had to be re-uploaded everywhere.
 */
export interface BlogTheme {
  css: string[];
  /** External stylesheet URLs the design referenced. */
  links: string[];
  /** External script URLs the design referenced. */
  scripts: string[];
  /** Inline script bodies. Recorded by the admin service, never run here. */
  inlineScripts: string[];
}

/** Nothing uploaded yet — the blog still has a design. */
const FALLBACK: BlogTheme = { css: [DEFAULT_BLOG_CSS], links: [], scripts: [], inlineScripts: [] };

const strings = (v: unknown): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x.trim()) : [];

export async function getBlogTheme(): Promise<BlogTheme> {
  try {
    const doc = await adminFirestore.collection("blog_theme").doc("current").get();
    if (!doc.exists) return FALLBACK;
    const d = doc.data() ?? {};
    const css = strings(d.css);
    return {
      // An empty stored theme is the same situation as no theme at all.
      css: css.length ? css : FALLBACK.css,
      links: strings(d.links),
      scripts: strings(d.scripts),
      inlineScripts: strings(d.inlineScripts),
    };
  } catch {
    // A missing or unreachable theme must not take the article down, and it
    // must not leave it unstyled either — the default is right here.
    return FALLBACK;
  }
}

/**
 * What the page is willing to load from the recorded design.
 *
 * The admin service RECORDS every external reference a document carried; this
 * decides which of them actually run, and the answer for anything off-origin is
 * no. The site's CSP would block them regardless (`script-src 'self'`,
 * `style-src 'self'`), so honouring them here would only produce console errors
 * and a half-styled page — and loosening the CSP would hand any uploaded
 * document the ability to run third-party code on our domain.
 *
 * The two the design actually needs are provided from our own origin instead:
 * Tailwind is vendored at /blog-tailwind.js, and Inter is self-hosted through
 * next/font.
 */
export function externalRefsBlocked(theme: BlogTheme): string[] {
  return [...theme.links, ...theme.scripts].filter((u) => /^(https?:)?\/\//i.test(u));
}
