/**
 * Confines a post's own CSS to the post.
 *
 * An HTML post carries the stylesheet it was designed with, and that stylesheet
 * was written as though it owned the page — `body { background: … }`,
 * `h2 { … }`, sometimes `* { … }`. Injected as-is it would restyle the site
 * around it: the header, the nav, every other element on the page. Prefixing
 * each selector with the post's own container makes the same rules apply only
 * inside the article.
 *
 * CSS cannot execute script, so this is not an XSS boundary. What it does stop
 * is a post reaching outside its container, and — by removing off-site `url()`
 * and `@import` — a stylesheet causing every reader's browser to call a third
 * party the reader never chose. Same-origin and data: references are kept, so
 * images the post uploaded still load.
 *
 * Deliberately a string transform rather than a CSS parser: the input is a
 * stylesheet an editor produced, the failure mode of a miss is a rule that does
 * not apply, and a parser dependency for that is not worth its weight.
 */

/** Rules that must not be prefixed — they are containers, not selectors. */
const AT_RULE_PASSTHROUGH = /^@(media|supports|layer|container)\b/i;

/**
 * Selectors that mean "the page". A post's container becomes the page as far as
 * the post is concerned, so these map onto the scope itself rather than being
 * prefixed into something that matches nothing (`.post-html body` never
 * matches, and the post would lose its own background).
 */
const PAGE_LEVEL = /^(html|body|:root|\*)$/i;

function scopeSelector(selector: string, scope: string): string {
  return selector
    .split(",")
    .map((part) => {
      const sel = part.trim();
      if (!sel) return "";
      if (PAGE_LEVEL.test(sel)) return scope;
      // Already scoped (an editor may emit nested rules) — leave it alone.
      if (sel.startsWith(scope)) return sel;
      return `${scope} ${sel}`;
    })
    .filter(Boolean)
    .join(", ");
}

/** True for a reference that leaves this origin. */
function isRemote(ref: string): boolean {
  const v = ref.trim().replace(/^['"]|['"]$/g, "");
  return /^(https?:)?\/\//i.test(v);
}

/**
 * Removes every reference that would make the reader's browser call a third
 * party. Used on stylesheets and on inline `style` attributes alike — both are
 * CSS, and the rule should not depend on where the CSS was written.
 */
export function stripRemoteRefs(css: string): string {
  return (
    css
      // @import always fetches, and always from somewhere else. There is no
      // scoped form of it, so it goes.
      .replace(/@import[^;]+;/gi, "")
      // Remote url() → dropped. A relative or data: URL is the post's own asset
      // and is kept.
      .replace(/url\(\s*([^)]+?)\s*\)/gi, (m, ref: string) =>
        isRemote(ref) ? "none" : m,
      )
  );
}

export function scopeCss(css: string, scope: string): string {
  // Strip comments first so a selector inside one cannot be scoped, and a
  // stray brace inside one cannot desynchronise the block walk below.
  let out = css.replace(/\/\*[\s\S]*?\*\//g, "");

  // The result is injected inside a <style> element, and the HTML parser ends
  // that element at the first `</style` regardless of CSS syntax — so a post
  // carrying one could close the tag and have whatever followed parsed as
  // markup. Nothing legitimate needs the sequence.
  out = out.replace(/<\/?(style|script)/gi, "");

  out = stripRemoteRefs(out);

  // Walk top-level blocks, prefixing selectors and recursing into at-rules
  // that wrap other rules (@media and friends).
  let result = "";
  let i = 0;
  while (i < out.length) {
    const open = out.indexOf("{", i);
    if (open === -1) break;

    const head = out.slice(i, open).trim();
    // Find this block's matching close brace, allowing for nesting.
    let depth = 1;
    let j = open + 1;
    while (j < out.length && depth > 0) {
      if (out[j] === "{") depth++;
      else if (out[j] === "}") depth--;
      j++;
    }
    const body = out.slice(open + 1, j - 1);

    if (head.startsWith("@")) {
      if (AT_RULE_PASSTHROUGH.test(head)) {
        // A conditional group: keep the condition, scope what is inside it.
        result += `${head}{${scopeCss(body, scope)}}`;
      } else {
        // @keyframes, @font-face and the like define names, not selectors —
        // scoping their contents would break them.
        result += `${head}{${body}}`;
      }
    } else if (head) {
      result += `${scopeSelector(head, scope)}{${body}}`;
    }
    i = j;
  }
  return result;
}

/** Applies scopeCss to every stylesheet a post carries. */
export function scopePostCss(css: string[], scope: string): string {
  return css
    .map((sheet) => scopeCss(sheet, scope))
    .filter((s) => s.trim())
    .join("\n");
}
