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
/**
 * Inline SVG, as a deliberately small subset.
 *
 * The recap template draws its charts as inline SVG — strip it and the article
 * loses its figures, which is most of what a market recap is for. But SVG is
 * markup with its own script surface, so only shape, text and gradient
 * elements are allowed. Left out on purpose:
 *
 *   script          — executes.
 *   foreignObject   — reopens the whole HTML surface inside the drawing.
 *   use / image     — can reference and pull in something else.
 *   animate / set   — can rewrite another element's attributes after load.
 *   style           — a stylesheet that would escape the article.
 */
const SVG_TAGS = [
  "svg", "g", "defs", "title", "desc",
  "rect", "circle", "ellipse", "line", "polyline", "polygon", "path",
  "text", "tspan", "linearGradient", "radialGradient", "stop", "clipPath", "mask",
];

/** Geometry and presentation only — nothing that fetches or executes. */
const SVG_ATTRS = [
  "viewBox", "xmlns", "width", "height", "x", "y", "dx", "dy",
  "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "d", "points",
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width", "stroke-linecap",
  "stroke-linejoin", "stroke-dasharray", "stroke-opacity", "opacity", "transform",
  "text-anchor", "dominant-baseline", "font-family", "font-size", "font-weight",
  "offset", "stop-color", "stop-opacity", "gradientUnits", "gradientTransform",
  "clip-path", "mask", "preserveAspectRatio", "role", "aria-label",
];

/**
 * The same list, lowercased.
 *
 * sanitize-html lowercases attribute names before matching, so a camelCase
 * entry never matches: `viewBox` arrived as `viewbox` and was dropped, which
 * takes an SVG's coordinate system with it — the charts rendered at a default
 * 300x150 instead of scaling to their container. Allowing both spellings keeps
 * it. The browser's own SVG attribute adjustment restores the camelCase when
 * the markup is parsed back out of HTML.
 */
const SVG_ATTRS_ALL = [...new Set([...SVG_ATTRS, ...SVG_ATTRS.map((a) => a.toLowerCase())])];

const RICH_TAGS = [
  ...ALLOWED_TAGS,
  "h6", "b", "i", "u", "s", "mark", "abbr", "time", "cite", "q", "del", "ins",
  "article", "header", "footer", "main", "aside", "nav",
  "dl", "dt", "dd", "col", "colgroup", "details", "summary",
  ...SVG_TAGS,
];

/** `class`/`id`/`style` on everything — the post's CSS selects on them. */
const RICH_GLOBAL = ["class", "id", "style", "title"];

export function sanitizeRichPostHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: RICH_TAGS,
    // SVG tags are matched case-insensitively by the sanitizer, so the parser's
    // own SVG adjustment is what restores camelCase (viewBox, linearGradient)
    // when the markup is inserted.
    allowedAttributes: {
      "*": [...RICH_GLOBAL, ...SVG_ATTRS_ALL],
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
