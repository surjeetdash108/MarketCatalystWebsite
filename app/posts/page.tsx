import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { BlogIndex } from "@/components/blog/BlogIndex";
import "./blog-index.css";

// Rendered per-request (this runs on App Hosting, not a static export) so the
// build never depends on Firestore / a composite index being ready. The list
// is small and the query is cheap.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog · MarketCatalyst",
  description: "Daily recaps, single-stock research and guides to how the market actually works.",
  alternates: { canonical: "/posts" },
};

export default async function PostsIndexPage() {
  const posts = await getPublishedPosts();
  return <BlogIndex posts={posts} />;
}
