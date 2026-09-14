import type { TocEntry } from "@/lib/blog/toc";

/**
 * The "On this page" overview, as an overlay rather than a column.
 *
 * The previous version of this nav was a 232px grid track sitting beside the
 * article, and together with the 52px share rail and the gaps it took 360px off
 * the document — which is what squeezed a page designed for 1180px into under
 * 400px. So it cannot be part of the layout again.
 *
 * It is `position: fixed` instead: it occupies no space in the flow, the
 * document keeps the full width of the page, and removing the nav from a post
 * changes nothing about how that post is laid out. It is also rendered OUTSIDE
 * `.post-doc`, so the post's own stylesheet cannot restyle it and
 * `.post-doc { overflow-x: clip }` cannot clip it.
 *
 * It only appears where there is genuinely empty gutter to sit in — see
 * `.post-toc` in blog-doc.css, which reveals it above 1460px, the width at
 * which a 1180px document (both presets cap there) leaves 140px either side.
 * Below that it is simply not shown; an overview is a convenience, and covering
 * the article to provide one is a bad trade.
 */
export function PostToc({ entries }: { entries: TocEntry[] }) {
  return (
    <aside className="post-toc" aria-label="On this page">
      <h4>On this page</h4>
      <ol>
        {entries.map((t) => (
          <li key={t.id}>
            <a href={`#${t.id}`}>{t.text}</a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
