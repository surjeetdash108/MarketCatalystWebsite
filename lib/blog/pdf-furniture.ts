/**
 * Finds the running header/footer band on a PDF so the pages can be drawn
 * without it.
 *
 * A research-desk export repeats its own furniture on every page — a rule with
 * "MarketCatalyst" and "Research Desk | Page 4" under it. On paper that is
 * navigation; on a web page it is noise interrupting the article every few
 * screens, under a site header that already says whose page this is.
 *
 * The band is found rather than hard-coded: the crop has to hold for whatever
 * the desk exports next, including a different template or page size.
 *
 * Everything here is in PDF points with the origin at the BOTTOM-left, which is
 * how pdf.js reports text positions. So `y` grows upward and a footer has a
 * SMALL y.
 */

export type PdfTextItem = {
  str: string;
  /** Baseline distance from the bottom of the page, in points. */
  y: number;
  /** Glyph height in points. */
  height: number;
};

export type PdfPageText = {
  /** MediaBox height in points. */
  height: number;
  items: PdfTextItem[];
};

export type FurnitureCrop = {
  /** Points to remove from the top of every page. */
  top: number;
  /** Points to remove from the bottom of every page. */
  bottom: number;
};

/** Only this fraction of the page, at each edge, is treated as a margin band. */
const BAND = 0.15;

/**
 * Extra points taken beyond the furniture text. The divider rule above a footer
 * is a drawn line, not text, so it is invisible to this pass — cropping to the
 * text alone leaves the rule stranded at the page edge. Always clamped against
 * real content below.
 */
const RULE_PAD = 0.028;

/** Content is never cropped closer than this to the cut. */
const MIN_GAP = 6;

/** Refuse to crop away more than this much of the page — a sign of bad input. */
const MAX_TOTAL_CROP = 0.3;

/**
 * Page numbers differ per page, so compare shapes, not strings: "Page 4" and
 * "Page 5" are the same piece of furniture.
 */
function shapeOf(str: string): string {
  return str.trim().replace(/\s+/g, " ").replace(/\d+/g, "#").toLowerCase();
}

function isRepeated(shape: string, counts: Map<string, number>, pageCount: number): boolean {
  const seen = counts.get(shape) ?? 0;
  // Half the pages, and never a conclusion drawn from a single page.
  return seen >= Math.max(2, Math.ceil(pageCount / 2));
}

export function furnitureCrop(pages: PdfPageText[]): FurnitureCrop {
  const none: FurnitureCrop = { top: 0, bottom: 0 };
  if (pages.length < 2) return none;

  const height = pages[0].height;
  if (!(height > 0)) return none;
  // A mixed-size document has no single crop that is right for every page.
  if (pages.some((p) => Math.abs(p.height - height) > 1)) return none;

  const band = height * BAND;

  // How many DISTINCT pages each text shape appears in, counted separately for
  // the two bands — a phrase can legitimately recur in body text without being
  // furniture, and furniture is defined by sitting in the margin.
  const bottomCounts = new Map<string, number>();
  const topCounts = new Map<string, number>();
  for (const page of pages) {
    const inBottom = new Set<string>();
    const inTop = new Set<string>();
    for (const item of page.items) {
      if (!item.str.trim()) continue;
      if (item.y < band) inBottom.add(shapeOf(item.str));
      else if (item.y + item.height > height - band) inTop.add(shapeOf(item.str));
    }
    for (const s of inBottom) bottomCounts.set(s, (bottomCounts.get(s) ?? 0) + 1);
    for (const s of inTop) topCounts.set(s, (topCounts.get(s) ?? 0) + 1);
  }

  // Split every item into furniture or content. An item is furniture only if it
  // sits in a margin band AND repeats across pages.
  let footerTop = 0; // highest point reached by bottom furniture
  let headerBottom = height; // lowest point reached by top furniture
  let hasFooter = false;
  let hasHeader = false;
  let contentMinY = height; // lowest content on any page
  let contentMaxY = 0; // highest content on any page

  for (const page of pages) {
    for (const item of page.items) {
      if (!item.str.trim()) continue;
      const shape = shapeOf(item.str);
      const top = item.y + item.height;
      const isFooter = item.y < band && isRepeated(shape, bottomCounts, pages.length);
      const isHeader = top > height - band && isRepeated(shape, topCounts, pages.length);
      if (isFooter) {
        hasFooter = true;
        footerTop = Math.max(footerTop, top);
      } else if (isHeader) {
        hasHeader = true;
        headerBottom = Math.min(headerBottom, item.y);
      } else {
        contentMinY = Math.min(contentMinY, item.y);
        contentMaxY = Math.max(contentMaxY, top);
      }
    }
  }

  const pad = height * RULE_PAD;

  let bottom = 0;
  if (hasFooter) {
    // Take the furniture plus the rule above it, but never eat into content —
    // the limit is set by the lowest body text found on ANY page, so one dense
    // page pulls the cut back for the whole document and every page stays the
    // same size.
    bottom = Math.min(footerTop + pad, contentMinY - MIN_GAP);
    // Detection landed on top of real content; trust the content, not the rule.
    if (bottom < footerTop) bottom = 0;
  }

  let top = 0;
  if (hasHeader) {
    top = Math.min(height - headerBottom + pad, height - contentMaxY - MIN_GAP);
    if (top < height - headerBottom) top = 0;
  }

  if (top < 0) top = 0;
  if (bottom < 0) bottom = 0;
  if (top + bottom > height * MAX_TOTAL_CROP) return none;

  return { top, bottom };
}
