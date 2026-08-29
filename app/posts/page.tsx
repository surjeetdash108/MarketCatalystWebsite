import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { getWeeklyReads } from "@/lib/blog/stats";
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
  // Both reads are independent, so they go together rather than in sequence.
  const [posts, reads] = await Promise.all([getPublishedPosts(), getWeeklyReads()]);
  return <BlogIndex posts={posts} reads={reads} />;
}
