import Script from "next/script";
import { sanitizeRichPostHtml } from "@/lib/security/sanitize";
import { scopeCss } from "@/lib/blog/scope-css";
import { PostThemeBinding } from "./PostThemeBinding";
import type { PostDesign } from "@/lib/blog/post-design";

/**
 * An authored HTML post, drawn as the document it is.
 *
 * The admin uploads a complete, designed page — its own header, headline, hero,
 * grid and footer, written against its own stylesheet — and the console
 * previews that file verbatim in a frame. So the article on the site has to be
 * the same page, or the preview is not a preview of anything.
 *
 * This component used to print a SECOND masthead above the document (a
 * MarketCatalyst badge, the form's title as an <h1>, the summary, chips and a
 * dateline) and then drop the document into the middle column of a
 * [share rail | article | on-this-page] grid. That grid is why a designed page
 * arrived unreadable: the rail takes 52px, the nav 232px and the gaps 76px, so
 * a document drawn for 1100px+ was laid out in under 400px. Its nav pills
 * stacked one per line, its search box overflowed, its card grids collapsed to
 * single broken columns, and its own headline landed underneath ours.
 *
 * So the frame is gone and the document gets the page. The title, summary and
 * cover still exist and are still authoritative — they are what the board card,
 * the browser tab, the JSON-LD and every link preview use — they are simply not
 * reprinted over a document that already states them.
 *
 * The cover image is NOT drawn here. It is the board card's thumbnail — often a
 * small one (this post's is 270x148) — and injecting it above the document put
 * a blurred, upscaled band in front of the document's OWN header, which is the
 * first thing the design draws. It still identifies the post everywhere a
 * thumbnail belongs: the board, link previews and the page metadata.
 */

/** The element the post's CSS is confined to, and the element its
 *  `html[data-theme=…]` rules therefore land on. One definition — the scope and
 *  the attribute have to agree or the theme blocks match nothing. */
const SCOPE = ".post-doc";
const DOC_ID = "mc-post-doc";

/**
 * A zero-specificity baseline, applied UNDER the post's own stylesheet.
 *
 * `:where()` contributes no specificity, so every rule here loses to anything
 * the document says — it only covers what the document does not mention.
 * Border-box is here because a design that sets it via `* { }` gets that rule
 * scoped, and until the scoper was fixed the reset reached the container but
 * none of its children.
 */
const BASELINE = `
:where(${SCOPE}), :where(${SCOPE} *), :where(${SCOPE} *::before), :where(${SCOPE} *::after) { box-sizing: border-box; }
:where(${SCOPE}) { width: 100%; margin: 0; }
:where(${SCOPE} img), :where(${SCOPE} svg), :where(${SCOPE} video) { max-width: 100%; height: auto; }
:where(${SCOPE} pre) { overflow-x: auto; }
:where(${SCOPE} table) { border-collapse: collapse; }
/* The wrapper put around every table below. Inert at full width; it is what
   lets a wide table scroll instead of widening the page. */
:where(${SCOPE}) .post-doc-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; max-width: 100%; }
`;

/**
 * The responsive safety net.
 *
 * A design uploaded here may be responsive, partly responsive, or not at all —
 * we do not control what gets written. Nothing the site does can invent a
 * designed mobile layout for a page that has none, but it CAN guarantee the
 * page never pushes the viewport sideways at any width, which is the difference
 * between "narrow" and "unusable".
 *
 * Every rule is confined to a max-width query and touches only properties that
 * cause overflow, always in the direction of fitting. A design that IS
 * responsive has already set these for itself at these widths, so the net costs
 * it nothing.
 */
const RESPONSIVE_NET = `
/* At EVERY width: a direct child of the document cannot be wider than the
   document. This is the fixed-width wrapper case — width:1200px on the outer
   .wrap — and it was the gap in the first version of this net, which only
   clamped below 760px: a 1200px page still overflowed every laptop and tablet
   between 761px and 1199px, which is most of them. Restricting it to direct
   children keeps it off the deliberately-wider decorations (a full-bleed band,
   a negative-margin rule) that live deeper in a design. */
${SCOPE} > * { max-width: 100% !important; }

@media (max-width: 1024px) {
  /* A flex or grid child defaults to min-width:auto, so it refuses to shrink
     below its content and pushes its whole row wider than the screen — the
     single most common reason an uploaded page overflows. */
  ${SCOPE} * { min-width: 0 !important; }
  /* Clamps fixed pixel widths further in, not just at the top level. */
  ${SCOPE} * { max-width: 100% !important; }
}
@media (max-width: 760px) {
${SCOPE} :where(img, svg, video, canvas) { height: auto !important; }
  /* A long ticker or URL cannot widen its column.

     break-word, NOT anywhere, and deliberately not on headings or links:
     overflow-wrap:anywhere also shrinks an element's MIN-CONTENT width, and
     combined with the min-width:0 above that let a flex item collapse to the
     width of one character — the brand lockup in a document's own header
     rendered as "M / ar / k / et / UI", one letter per line. break-word breaks
     the same long words but leaves intrinsic sizing alone, so a flex row still
     reserves the space its content needs. */
  ${SCOPE} :where(p, li, td, th, dd, blockquote, figcaption) { overflow-wrap: break-word; }
  /* A sticky nav inside the document must not also pin under the site header. */
  ${SCOPE} :where(header, nav) { position: static !important; }
}
@media (max-width: 560px) {
  /* Phone width: a multi-column track cannot fit, whatever it was set to.
     minmax(0,1fr) rather than 1fr so a long unbreakable string in a cell
     still cannot force the track wider than the column. */
  ${SCOPE} :where(div, section, main, article, aside, ul, ol) {
    grid-template-columns: minmax(0, 1fr) !important;
  }
  /* A row of fixed-width cards wraps instead of overflowing.

     Content containers only — NOT header/footer/nav. Those hold brand lockups
     and nav bars that a design gives a fixed height, so wrapping them pushed
     the second half of a logo out through the bottom of its own header. A card
     row is what needs to wrap; site chrome already has the design's own
     handling, and where it does not, min-width:0 above is enough. */
  ${SCOPE} :where(div, section, ul, ol) { flex-wrap: wrap; }
}
`;

/**
 * Wraps every table in a scroll container.
 *
 * In the markup rather than in CSS because the CSS answer — forcing
 * `display:block` on the table itself — changes how the table lays its own
 * columns out, and a design that styles its tables would fight it. A wrapper
 * touches nothing the post wrote.
 */
function wrapTables(html: string): string {
  return html.replace(
    /<table\b[\s\S]*?<\/table>/gi,
    (t) => `<div class="post-doc-scroll">${t}</div>`,
  );
}

export function PostHtmlDoc({
  html,
  design,
}: {
  html: string;
  design: PostDesign;
}) {
  const { theme, rootAttrs } = design;

  // Safe: sanitizeRichPostHtml is an allowlist — no script, iframe, object,
  // form, on* handler or non-http scheme survives it.
  const body = wrapTables(sanitizeRichPostHtml(html));

  /**
   * Scoped to the document container, which IS the page as far as the post is
   * concerned — so `body { … }`, `:root { … }`, `html[data-theme] { … }` and
   * `* { … }` all resolve onto it and everything under it. See scopeCss, which
   * had been collapsing the universal selector onto the container alone and so
   * silently dropping the `* { box-sizing: border-box }` reset every authored
   * design opens with.
   */
  const themeCss = scopeCss(theme.css.join("\n"), SCOPE);

  /* The document's own <html>/<body> attributes, carried onto the container.
     `data-theme="light"` is the one that matters: these designs define every
     colour token inside `html[data-theme=…]` with no unqualified fallback, so
     without the attribute not one of those blocks matches and every var()
     resolves to nothing — black text, no backgrounds, no borders.

     `class` and `style` are handled separately: ours must survive alongside a
     class the document sets, and React wants an object for `style` where this
     is already CSS text. */
  const { class: docClass, style: docStyle, ...attrs } = rootAttrs;
  const docStyleCss = docStyle ? `${SCOPE}{${docStyle}}` : "";
  const themeGated = /\[data-theme\s*[~|^$*]?=/.test(themeCss);
  const docTheme = attrs["data-theme"] ?? (themeGated ? "light" : undefined);

  return (
    <div
      {...attrs}
      id={DOC_ID}
      {...(docTheme ? { "data-theme": docTheme } : {})}
      className={docClass ? `${docClass} post-doc` : "post-doc"}
    >
      {/* Rendered inside the article rather than hoisted to <head> because it
          belongs to this page only, and `</style` is stripped so a stylesheet
          cannot close its own tag and open markup.

          Order is the cascade: baseline (zero specificity, always loses), the
          post's own sheet, its inline body style, then the safety net — the
          only part meant to win, and only below a breakpoint. */}
      <style
        dangerouslySetInnerHTML={{
          __html: [BASELINE, themeCss, docStyleCss, RESPONSIVE_NET]
            .filter(Boolean)
            .join("\n")
            .replace(/<\/?(style|script)/gi, ""),
        }}
      />

      {/* Tailwind, from our own origin. The uploaded design loads it from a CDN;
          serving our own copy renders the same page without a third-party
          script on our domain, and without loosening the CSP to allow one.
          afterInteractive so the markup is in the DOM when it scans for
          classes — it compiles what it finds. */}
      <Script src="/blog-tailwind.js" strategy="afterInteractive" />

      <div dangerouslySetInnerHTML={{ __html: body }} />

      {/* Follows the site's light/dark toggle. Server-rendered above first, so
          the article is styled with scripting off. */}
      {themeGated && <PostThemeBinding targetId={DOC_ID} />}
    </div>
  );
}
