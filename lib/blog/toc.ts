/**
 * Builds the "On this page" table of contents from a post's own <h2> headings.
 *
 * Runs on the server against the sanitized article HTML, so the nav ships in the
 * initial markup (SEO + works with JS off) rather than being assembled in the
 * browser. Every post gets its own TOC from whatever sections it actually has —
 * nothing is hard-coded per article. Each h2 is given a stable `sec-N` id (an
 * author-supplied id is respected) so the nav links and scroll-spy line up.
 *
 * A deliberate string transform, matching scopeCss's reasoning: the input is
 * editor-produced HTML, a missed match just means one heading without a TOC
 * entry, and a full DOM parser is not worth its weight here.
 */

export interface TocEntry {
  id: string;
  text: string;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
  "&#39;": "'", "&apos;": "'", "&nbsp;": " ", "&mdash;": "—", "&ndash;": "–",
};

/** Plain text of a heading: drop inner tags, collapse whitespace, decode the
 *  handful of entities an editor emits. */
function headingText(inner: string): string {
  return inner
    .replace(/<[^>]+>/g, "")
    .replace(/&#?\w+;/g, (e) => ENTITIES[e.toLowerCase()] ?? e)
    .replace(/\s+/g, " ")
    .trim();
}

export function buildToc(html: string): { html: string; toc: TocEntry[] } {
  const toc: TocEntry[] = [];
  let i = 0;

  const withIds = html.replace(
    /<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi,
    (_m, attrs: string, inner: string) => {
      const existing = /\bid\s*=\s*["']([^"']+)["']/i.exec(attrs);
      const id = existing ? existing[1] : `sec-${i}`;
      const text = headingText(inner);
      // Skip a truly empty heading — it would be an unclickable blank TOC row.
      if (text) toc.push({ id, text });
      i++;
      return existing ? `<h2${attrs}>${inner}</h2>` : `<h2 id="${id}"${attrs}>${inner}</h2>`;
    },
  );

  return { html: withIds, toc };
}
