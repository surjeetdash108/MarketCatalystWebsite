import { renderPostContent } from "@/lib/blog/render-markdown";

export function PostBody({ markdown }: { markdown: string }) {
  const html = renderPostContent(markdown);
  // Safe: renderPostContent always runs the markdown through the
  // sanitize-html allowlist before returning — see lib/blog/render-markdown.ts.
  return <div className="post-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
