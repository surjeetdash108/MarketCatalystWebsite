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
 * Selectors that mean "the page", as the FIRST token of a compound selector.
 *
 * A post's container becomes the page as far as the post is concerned, so this
 * token is REPLACED by the scope rather than prefixed with it. Prefixing
 * produces a selector that can never match — `.post-doc body > .grid` describes
 * a <body> inside our article, which no document contains — and that is how a
 * designed page silently lost every rule it anchored at the document root.
 *
 * Matched at the head of the selector, not against the whole of it: `body`,
 * `body.dark`, `body > .wrap` and `:root[data-theme="dark"] .card` are all the
 * same situation, and only the exact-match form was being handled.
 */
const PAGE_LEVEL_HEAD = /^(?:html|body|:root)\b/i;

/** The same token, with the qualifiers attached to it (`body.dark`, `:root[…]`). */
const ROOT_TOKEN = /^(?:html|body|:root)\b((?:[.:#[][^\s>+~,]*)*)/i;

/**
 * The universal selector, which needs the opposite treatment.
 *
 * `* { box-sizing: border-box }` is the first line of most authored designs.
 * Collapsing it to the scope alone applied the reset to the container and to
 * NOTHING INSIDE IT, so every child kept content-box sizing and every padded,
 * percentage-width grid in the document overflowed its column. It has to become
 * "the scope and everything under it".
 */
const UNIVERSAL_HEAD = /^\*(?![-\w])/;

/**
 * Splits on top-level commas only.
 *
 * A naive `split(",")` is wrong for any selector written this decade.
 * `:is(h1, h2, h3)` became `:is(h1`, `h2`, `h3)` — three fragments, each then
 * prefixed, producing `.post-doc :is(h1, .post-doc h2, .post-doc h3)`, which
 * the browser throws away whole. The same applied to `:where()`, `:not()`,
 * `:has()` and to any attribute value containing a comma
 * (`[data-tags="a,b"]`). Those rules did not misapply — they vanished.
 *
 * Parens and brackets nest; quotes suspend both, because a comma inside a
 * string is data.
 */
function splitTopLevel(input: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let cur = "";
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote) {
      cur += c;
      // A quote closes only when it is not itself escaped.
      if (c === quote && input[i - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'") { quote = c; cur += c; continue; }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === "," && depth === 0) { out.push(cur); cur = ""; continue; }
    cur += c;
  }
  out.push(cur);
  return out;
}

/** Index of the last semicolon that is not inside quotes, parens or brackets. */
function lastTopLevelSemicolon(input: string): number {
  let depth = 0;
  let quote: string | null = null;
  let found = -1;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (quote) {
      if (c === quote && input[i - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'") quote = c;
    else if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth--;
    else if (c === ";" && depth === 0) found = i;
  }
  return found;
}

function scopeSelector(selector: string, scope: string): string {
  const parts: string[] = [];
  for (const part of splitTopLevel(selector)) {
    const sel = part.trim();
    if (!sel) continue;

    // Already scoped (an editor may emit nested rules) — leave it alone.
    if (sel.startsWith(scope)) {
      parts.push(sel);
      continue;
    }

    if (UNIVERSAL_HEAD.test(sel)) {
      const rest = sel.slice(1).trim();
      if (!rest) {
        // A bare `*` — the scope itself plus every descendant.
        parts.push(scope, `${scope} *`);
      } else if (/^[>+~]/.test(rest)) {
        /* `* > .x`, `* + *` — the universal is a real position in a combinator
           chain, so it stays and only gains the scope in front of it.
           Deliberately NOT also emitting a form where the scope itself takes
           that position: `.post-doc + *` would style the element AFTER the
           article, which is the site's own markup. Under-reaching inside the
           post is the safe direction; reaching outside it is not. */
        parts.push(`${scope} ${sel}`);
      } else {
        // `*.card`, `*:hover` — a compound whose first token is the universal.
        parts.push(`${scope} ${sel}`);
      }
      continue;
    }

    if (PAGE_LEVEL_HEAD.test(sel)) {
      /* Consume every leading document-root token, keeping what qualified it.
         `body` and `:root` are the same place, a design may write both
         (`html body .wrap`), and either can carry a qualifier that still means
         something (`body.dark .card` → `.post-doc.dark .card`). Stripping only
         the first token would leave `.post-doc body .wrap`: a <body> inside our
         article, which no document contains. */
      let rest = sel;
      let qualifiers = "";
      for (;;) {
        const m = ROOT_TOKEN.exec(rest);
        if (!m) break;
        qualifiers += m[1];
        // Whatever follows the token; a combinator or a descendant, never more
        // of the token itself (ROOT_TOKEN is word-boundary anchored).
        rest = rest.slice(m[0].length).trimStart();
      }
      parts.push(`${scope}${qualifiers}${rest ? ` ${rest}` : ""}`.trim());
      continue;
    }

    parts.push(`${scope} ${sel}`);
  }
  return [...new Set(parts)].filter(Boolean).join(", ");
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

    /* A STATEMENT at-rule ends at a semicolon, not at a block, so it lands in
       this rule's head and takes the selector after it down with it:
       `@charset "utf-8"; .lede{…}` was emitted as one malformed rule and the
       browser dropped BOTH — a stylesheet that merely opened with @charset
       (most exported ones do) silently lost its first rule. Split them off. */
    const rawHead = out.slice(i, open);
    const semi = lastTopLevelSemicolon(rawHead);
    let head = rawHead;
    if (semi !== -1) {
      for (const stmt of rawHead.slice(0, semi + 1).split(";")) {
        const t = stmt.trim();
        // @layer's declaration fixes the order of layers used further down, so
        // dropping it would reorder the cascade. @charset says nothing inside a
        // <style> element, and @namespace can stop selectors matching HTML at
        // all — neither survives.
        if (/^@layer\b/i.test(t)) result += `${t};`;
      }
      head = rawHead.slice(semi + 1);
    }
    head = head.trim();
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
