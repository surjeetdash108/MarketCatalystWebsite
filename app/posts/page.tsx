import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { BlogBoard } from "@/components/blog/BlogBoard";
import "./blog-board.css";

// Rendered per-request (this runs on App Hosting, not a static export) so the
// build never depends on Firestore / a composite index being ready. The list
// is small and the query is cheap.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs — MarketCatalyst",
  description: "Market analysis, product updates, and insights from the MarketCatalyst team.",
  alternates: { canonical: "/posts" },
};

export default async function PostsIndexPage() {
  const posts = await getPublishedPosts();
  return <BlogBoard posts={posts} />;
}
