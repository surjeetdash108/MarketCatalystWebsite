import "server-only";
import { adminFirestore } from "@/lib/firebase/admin";
import type { Post } from "./posts";
import { getBlogTheme, type BlogTheme } from "./theme";
import { stripRemoteRefs } from "./scope-css";

/**
 * The stylesheet a given post publishes with.
 *
 * WHY this is not simply `getBlogTheme()`: the theme is ONE document, written
 * on every html upload with `{ merge: false }`. It is the site's house style
 * and it is correct that the newest upload defines it — but it was also the
 * only place a post's CSS lived, so an article published in March was redrawn
 * with April's stylesheet the moment April was uploaded. Selectors that did not
 * happen to match March's markup stopped applying, and a designed, responsive
 * page degraded to unstyled HTML on a page nobody had touched.
 *
 * A post now carries its own `css` (written by the admin service). This resolves
 * that first, heals a post that predates the field from the document it already
 * stores, and falls back to the shared theme only when there is nothing else.
 */

/**
 * The attributes an authored document sets on its own <html>/<body>.
 *
 * WHY a post needs these at all: these designs put EVERY colour in
 * `html[data-theme="light"]` / `html[data-theme="dark"]` blocks, with no
 * unqualified fallback — and the document ships as `<html data-theme="light">`.
 * The console previews the whole file, so the attribute is there and the page
 * is styled. The site keeps only the <body> contents, so the attribute was
 * dropped, no theme block matched, and every `var(--bg)`, `var(--ink)` and
 * `var(--line)` resolved to nothing: black text on no background, no borders,
 * no cards. That is the "it published as plain HTML" report, and it happened on
 * upload day — a later upload was never needed to cause it.
 *
 * Carried onto the post's container instead, which is where scopeCss now sends
 * those same `html[…]` / `:root[…]` selectors.
 */
export type RootAttrs = Record<string, string>;

/** Presentation only. `on*` handlers, `src`, `href` and everything else that
 *  could act or fetch are excluded by not being on this list. */
const SAFE_ROOT_ATTR = /^(?:class|lang|dir|style|data-[a-z0-9-]+)$/i;

function readAttrs(tag: string | undefined, into: RootAttrs): void {
  if (!tag) return;
  const re = /([a-zA-Z_:][-\w:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag)) !== null) {
    const name = m[1].toLowerCase();
    if (!SAFE_ROOT_ATTR.test(name)) continue;
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    // class is the one that legitimately appears on both <html> and <body>
    // (`<html class="no-js"><body class="dark">`), so they are combined rather
    // than the second silently replacing the first.
    into[name] =
      name === "class" && into.class ? `${into.class} ${value}`.trim() : value;
  }
}

export function extractRootAttrs(documentHtml: string): RootAttrs {
  const attrs: RootAttrs = {};
  readAttrs(/<html\b([^>]*)>/i.exec(documentHtml)?.[1], attrs);
  readAttrs(/<body\b([^>]*)>/i.exec(documentHtml)?.[1], attrs);
  // Inline CSS is CSS: an off-site url() here would call a third party exactly
  // as one in the stylesheet would.
  if (attrs.style) attrs.style = stripRemoteRefs(attrs.style);
  return attrs;
}

/** Every <style> block in a document, in order. Mirrors extractTheme in the backend. */
export function extractStyles(documentHtml: string): string[] {
  const out: string[] = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(documentHtml)) !== null) {
    const css = m[1].trim();
    if (css) out.push(css);
  }
  return out;
}

/**
 * Writes a healed stylesheet back onto the post.
 *
 * Best-effort and fire-and-forget: the article is the thing being served, and a
 * failed write only means the next reader heals it again. Never awaited on the
 * render path.
 */
function persist(id: string, css: string[]): void {
  adminFirestore
    .collection("blogs")
    .doc(id)
    // Not `updatedAt` — this is a repair of how the post was already stored,
    // not an edit of it, and bumping the timestamp would reorder the admin list
    // for something no admin did.
    .update({ css })
    .catch(() => {});
}

export type PostDesign = { theme: BlogTheme; rootAttrs: RootAttrs };

export async function resolvePostDesign(post: Post): Promise<PostDesign | null> {
  if (post.format !== "html") return null;

  // The document the post was uploaded as. It carries the root attributes, and
  // — for a post stored before `css` existed — the stylesheet too.
  const rootAttrs = post.documentHtml ? extractRootAttrs(post.documentHtml) : {};

  // The post's own design, as stored.
  if (post.css.length) return { theme: sheet(post.css), rootAttrs };

  /* Written before the design was kept per post — but its document IS stored,
     and the document is where that design came from. Recovering it here is what
     makes an existing post go back to looking the way it was uploaded, with no
     re-upload and no migration to run. */
  if (post.documentHtml) {
    const css = extractStyles(post.documentHtml);
    if (css.length) {
      persist(post.id, css);
      return { theme: sheet(css), rootAttrs };
    }
  }

  // Genuinely carries no design of its own: an authored fragment, written
  // against the house style. That is exactly what the shared theme is for.
  return { theme: await getBlogTheme(), rootAttrs };
}

const sheet = (css: string[]): BlogTheme => ({
  css,
  // Recorded by the admin service, never loaded here — see externalRefsBlocked.
  links: [],
  scripts: [],
  inlineScripts: [],
});
