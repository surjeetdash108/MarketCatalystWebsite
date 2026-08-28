import sanitizeHtml from "sanitize-html";
import { stripRemoteRefs } from "@/lib/blog/scope-css";

// Applied at write time (before a post's rendered HTML is stored/derived)
// AND again at render time immediately before any dangerouslySetInnerHTML
// use on the public blog — defense in depth against stored XSS from a
// compromised or malicious editor account, and against any write path that
// bypassed the primary sanitization step.
const ALLOWED_TAGS = [
  "p", "h1", "h2", "h3", "h4", "h5", "strong", "em", "a", "ul", "ol", "li",
  "blockquote", "img", "code", "pre", "br", "hr", "span", "small", "sup", "sub",
  // Tables were absent, which silently DELETED every table a post contained:
  // marked emits a correct <table>, this pass dropped it, and the reader was
  // left with the cells as loose text. That is why the research-desk posts read
  // as a wall of fragments — a data table could not be published at all.
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption",
  // Layout containers for the research-desk blocks (KPI row, callouts, meta
  // strip). Styling is by class only — see ALLOWED_ATTRIBUTES.
  "div", "section", "figure", "figcaption",
];

/**
 * `class` is allowed on the structural tags so a post can opt into the
 * research-desk components (`.post-kpis`, `.post-callout`, `.post-meta`).
 *
 * `class` carries no script vector on its own: `style`, `on*` handlers,
 * `srcdoc`, `formaction` and every scheme other than http/https/mailto remain
 * blocked, and `script`/`iframe`/`object`/`style` are still not allowed tags.
 * The worst a hostile class value can do is borrow a look that already exists
 * in the site's own stylesheet.
 */
const STRUCTURAL = ["div", "section", "figure", "figcaption", "span", "p", "table", "th", "td", "tr", "thead", "tbody", "small"];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "rel", "target"],
  img: ["src", "alt"],
  ...Object.fromEntries(STRUCTURAL.map((t) => [t, ["class"]])),
  // Genuine table semantics, needed for the scorecard layouts and for screen
  // readers. Numeric-only by the allowedAttributes regex below.
  th: ["class", "colspan", "rowspan", "scope"],
  td: ["class", "colspan", "rowspan"],
};

export function sanitizePostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow" }),
    },
  });
}

/**
 * The allowlist for an `html`-format post, where the markup IS the design.
 *
 * Markdown posts are prose the site styles; an html post arrives with its own
 * stylesheet and a structure written to match it, so the pass above would take
 * it apart — dropping the sectioning elements it lays out with, and the `id`
 * and `class` hooks its own CSS selects on. Widening those is what makes the
 * format work at all.
 *
 * What stays blocked is what can execute or fetch: `script`, `iframe`,
 * `object`, `embed`, `form`, every `on*` handler, and any scheme other than
 * http/https/mailto/data-image. `style` is permitted as an attribute (a
 * designed document sets one-off values inline), but is passed through
 * `stripRemoteRefs` first, so an inline rule cannot call out to a third party
 * any more than the stylesheet can.
 */
const RICH_TAGS = [
  ...ALLOWED_TAGS,
  "h6", "b", "i", "u", "s", "mark", "abbr", "time", "cite", "q", "del", "ins",
  "article", "header", "footer", "main", "aside", "nav",
  "dl", "dt", "dd", "col", "colgroup", "details", "summary",
];

/** `class`/`id`/`style` on everything — the post's CSS selects on them. */
const RICH_GLOBAL = ["class", "id", "style", "title"];

export function sanitizeRichPostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: RICH_TAGS,
    allowedAttributes: {
      "*": RICH_GLOBAL,
      a: [...RICH_GLOBAL, "href", "rel", "target"],
      img: [...RICH_GLOBAL, "src", "alt", "width", "height", "loading"],
      th: [...RICH_GLOBAL, "colspan", "rowspan", "scope"],
      td: [...RICH_GLOBAL, "colspan", "rowspan"],
      time: [...RICH_GLOBAL, "datetime"],
      col: [...RICH_GLOBAL, "span"],
      colgroup: [...RICH_GLOBAL, "span"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Inline images the post embedded itself, which carry no request.
    allowedSchemesByTag: { img: ["http", "https", "data"] },
    // One transform for every tag: sanitize-html runs the tag-specific entry OR
    // the "*" fallback, never both, so an `a` entry of its own would exempt
    // links from the inline-style pass.
    transformTags: {
      "*": (tagName, attribs) => {
        const next = { ...attribs };
        if (next.style) next.style = stripRemoteRefs(next.style);
        if (tagName === "a") next.rel = "noopener noreferrer nofollow";
        return { tagName, attribs: next };
      },
    },
  });
}
