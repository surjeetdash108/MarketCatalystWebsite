import { permanentRedirect } from "next/navigation";

// Individual posts moved to /posts/view?slug=<slug>. 308-redirect the old
// /blog/<slug> permalinks so bookmarks and SEO equity carry over.
export default async function BlogPostRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/posts/view?slug=${encodeURIComponent(slug)}`);
}
