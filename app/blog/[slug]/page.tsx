import { permanentRedirect } from "next/navigation";

// Individual posts moved to the statically generated /posts/<slug>.
// 308-redirect the old /blog/<slug> permalinks so bookmarks and SEO equity
// carry over, and in one hop rather than via /posts/view.
export default async function BlogPostRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/posts/${encodeURIComponent(slug)}`);
}
