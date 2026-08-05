import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // A transient Firestore error (or a composite index that is still building)
  // must not fail the whole build/deploy — fall back to the static routes.
  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  try {
    posts = await getPublishedPosts();
  } catch (err) {
    console.error("sitemap: failed to load posts, emitting static routes only", err);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/posts`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/faqs`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/posts/view?slug=${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...postRoutes];
}
