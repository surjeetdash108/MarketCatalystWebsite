import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { PostList } from "@/components/blog/PostList";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blogs — MarketCatalyst",
  description: "Market analysis, product updates, and insights from the MarketCatalyst team.",
  alternates: { canonical: "/posts" },
};

export default async function PostsIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="mb-8 text-3xl font-semibold">Blogs</h1>
      <PostList posts={posts} />
    </main>
  );
}
