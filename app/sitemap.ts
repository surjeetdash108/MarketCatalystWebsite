import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { FEATURE_VIEWS } from "@/lib/features/features";

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

  // Authored pages change when the site is deployed (see BUILD_TIME in
  // next.config.ts); the blog index changes whenever a post does.
  const deployed = process.env.BUILD_TIME ? new Date(process.env.BUILD_TIME) : undefined;
  const newestPost = posts.reduce<Date | undefined>((latest, post) => {
    const at = new Date(post.updatedAt);
    return !latest || at > latest ? at : latest;
  }, undefined);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: deployed, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/posts`, lastModified: newestPost ?? deployed, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/features`, lastModified: deployed, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/about`, lastModified: deployed, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faqs`, lastModified: deployed, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: deployed, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/legal/terms`, lastModified: deployed, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacy`, lastModified: deployed, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Same list /features/[slug] builds its pages from, so a new feature is
  // listed here as soon as it exists.
  const featureRoutes: MetadataRoute.Sitemap = FEATURE_VIEWS.map((f) => ({
    url: `${base}/features/${f.slug}`,
    lastModified: deployed,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/posts/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...featureRoutes, ...postRoutes];
}
