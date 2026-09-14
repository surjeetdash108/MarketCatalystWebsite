import { permanentRedirect, redirect } from "next/navigation";

/**
 * The article moved to a statically generated /posts/<slug>.
 *
 * This page existed only because it read the slug from a query string, which is
 * what made every article render dynamically on every request. It stays as a
 * 308 so the URLs already in sitemaps, bookmarks and link previews resolve.
 */
export default async function PostViewRedirect({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string | string[] }>;
}) {
  const raw = (await searchParams).slug;
  const slug = Array.isArray(raw) ? raw[0] : raw;
  if (!slug) redirect("/posts");
  permanentRedirect(`/posts/${encodeURIComponent(slug)}`);
}
