import type { MetadataRoute } from "next";
import { getPublishedPosts, type Post } from "@/lib/blog/posts";
import { FEATURE_VIEWS } from "@/lib/features/features";
import { DUPLICATE_POSTS } from "@/lib/seo/duplicate-posts";

/* Built on request, not at deploy. Prerendered, the sitemap froze at the last
   deploy and every post published after it was missing (7 of the newest 10
   when this was found). ISR is no fix here: on App Hosting the background
   regeneration never completes (Cloud Run throttles CPU after the response),
   the same reason app/page.tsx is dynamic. */
export const dynamic = "force-dynamic";

/* Every request would otherwise read every published post, a list that grows
   by 5-6 a day. Held in memory for five minutes instead - new posts appear
   within that, and Google re-reads a sitemap on a scale of hours anyway.
   Failures are not cached, so the next request simply tries again. */
const POSTS_TTL_MS = 5 * 60 * 1000;
let cachedPosts: { at: number; posts: Post[] } | null = null;
/** Concurrent requests share one Firestore read rather than each starting one. */
let inFlight: Promise<Post[]> | null = null;

async function publishedPosts(): Promise<Post[]> {
  if (cachedPosts && Date.now() - cachedPosts.at < POSTS_TTL_MS) return cachedPosts.posts;
  inFlight ??= getPublishedPosts()
    .then((posts) => {
      cachedPosts = { at: Date.now(), posts };
      return posts;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

const duplicateSlugs = new Set(DUPLICATE_POSTS.map(([copy]) => copy));

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  // A transient Firestore error (or a composite index that is still building)
  // must not fail the whole build/deploy — fall back to the static routes.
  let posts: Post[] = [];
  try {
    // Duplicate copies 301 to their original, and a sitemap should list only
    // URLs that answer 200.
    posts = (await publishedPosts()).filter((post) => !duplicateSlugs.has(post.slug));
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
