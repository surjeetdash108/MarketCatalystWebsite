import { renderPostContent } from "@/lib/blog/render-markdown";
import { demoteH1 } from "@/lib/blog/headings";

/**
 * `keepFirstH1`: the post's own first <h1> is the page headline (the article
 * page printed none). Otherwise the page already has an <h1>, and any in the
 * body are demoted so the article keeps just one.
 */
export function PostBody({ markdown, keepFirstH1 = false }: { markdown: string; keepFirstH1?: boolean }) {
  const html = demoteH1(renderPostContent(markdown), keepFirstH1);
  // Safe: renderPostContent always runs the markdown through the
  // sanitize-html allowlist before returning — see lib/blog/render-markdown.ts.
  return <div className="post-content mc-doc" dangerouslySetInnerHTML={{ __html: html }} />;
}
