import Script from "next/script";
import { sanitizeRichPostHtml } from "@/lib/security/sanitize";
import { scopeCss } from "@/lib/blog/scope-css";
import { PostThemeBinding } from "./PostThemeBinding";
// Both used only by the commented-out "On this page" overview below.
// import { PostToc } from "./PostToc";
// import { TocSpy } from "./TocSpy";
import { buildToc } from "@/lib/blog/toc";
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
:where(${SCOPE}) { width: 100%; max-width: 1180px; margin-left: auto; margin-right: auto; padding: 0 clamp(16px, 4vw, 32px); box-sizing: border-box; }
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
 * Guarantees that laptop & desktop viewports receive full-width, centered,
 * readable multi-column layouts, while tablets and mobile gracefully adapt
 * without overflow.
 */
const RESPONSIVE_NET = `
${SCOPE} { max-width: 1180px !important; margin-left: auto !important; margin-right: auto !important; width: 100% !important; box-sizing: border-box !important; }
${SCOPE} > * { max-width: 100% !important; }
${SCOPE} > div { max-width: 100% !important; width: 100% !important; }
${SCOPE} main { max-width: 100% !important; margin-left: auto !important; margin-right: auto !important; padding: 0 0 80px !important; width: 100% !important; }
${SCOPE} .card { max-width: 100% !important; margin-left: auto !important; margin-right: auto !important; margin-bottom: 36px !important; width: 100% !important; }
${SCOPE} .card-body { padding: 36px clamp(20px, 4vw, 56px) 0; }
${SCOPE} .stat-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin: 20px 0 32px; }
${SCOPE} .bullbear-wrap { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin: 24px 0 32px; }
${SCOPE} .toc ol { columns: 2; column-gap: 32px; }

@media (max-width: 1024px) {
  ${SCOPE} * { min-width: 0; }
  ${SCOPE} * { max-width: 100%; }
}
@media (max-width: 768px) {
  ${SCOPE} .card-body { padding: 24px 16px 0 !important; }
  ${SCOPE} .stat-strip { grid-template-columns: repeat(2, 1fr) !important; gap: 10px !important; }
  ${SCOPE} .bullbear-wrap { grid-template-columns: 1fr !important; gap: 14px !important; }
  ${SCOPE} .toc ol { columns: 1 !important; }
  ${SCOPE} :where(img, svg, video, canvas) { height: auto !important; }
  ${SCOPE} :where(p, li, td, th, dd, blockquote, figcaption) { overflow-wrap: break-word; }
  ${SCOPE} :where(h1, h2, h3, h4, h5, h6, p, li, dd, blockquote, figcaption, a, span, div, strong, em) {
    white-space: normal !important;
  }
  ${SCOPE} :where(header, nav) { position: static !important; }
}
@media (max-width: 480px) {
  ${SCOPE} .stat-strip { grid-template-columns: 1fr !important; }
  ${SCOPE} :where(div, section, main, article, aside, ul, ol) {
    grid-template-columns: minmax(0, 1fr) !important;
  }
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
  const sanitized = sanitizeRichPostHtml(html);
  // Give each <h2> a stable id and collect the section list for the overview.
  // buildToc only ADDS ids; it changes nothing else about the markup, so a post
  // renders identically whether or not the overview ends up being shown.
  const { html: withIds, toc } = buildToc(sanitized);
  const body = wrapTables(withIds);

  /* Three sections, not two: this is an overview, and a two-item list beside a
     long article tells the reader less than the article's own headings already
     do. Below the threshold nothing is rendered at all — no empty rail. */
  // Kept for the commented-out overview at the end of this file.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasToc = toc.length >= 3;

  /* Capped, because the rail does not scroll. Entries past the bottom of the
     viewport would be clipped by `overflow:hidden` and simply not exist for the
     reader — so the cap is the honest version of the same limit, and it keeps
     the rail short enough that the clip never actually fires. Ten full-text
     entries at 10.5px come to roughly 300px. */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const tocEntries = toc.slice(0, 10);

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

  const doc = (
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

  /* The "On this page" overview is TURNED OFF on the article page — commented
     out rather than deleted so it is a one-line revert.

     Everything it needs is still built above (`toc`, `hasToc`, `tocEntries`)
     and both components still exist, so restoring it is a matter of dropping
     the early return below and un-commenting the block.

     When it was on: the overview was a SIBLING of the document, never a child —
     outside .post-doc the post's own stylesheet cannot restyle it, and
     .post-doc { overflow-x: clip } cannot clip it. It is fixed-position, so it
     takes no space and the document keeps the whole page either way. */
  return doc;

  // if (!hasToc) return doc;
  // return (
  //   <>
  //     {doc}
  //     <PostToc entries={tocEntries} />
  //     {/* Client-only: highlights the current section while scrolling. */}
  //     <TocSpy />
  //   </>
  // );
}
