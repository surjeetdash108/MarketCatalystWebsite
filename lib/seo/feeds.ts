import type { PostSummary } from "@/lib/blog/posts";

/**
 * What the two feed routes (app/feed.xml, app/news-sitemap.xml) share: the site
 * URL, XML escaping, and the date a post goes out under. The posts themselves
 * come from getLivePostSummaries (lib/blog/posts.ts).
 */

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

export function xmlEscape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** The date a post went live: published where it exists, created otherwise. */
export function postDate(post: PostSummary): Date {
  return new Date(post.publishedAt ?? post.createdAt);
}

/**
 * Headers for a feed response. Public and cacheable at the CDN for five minutes,
 * which is as stale as the post cache behind it already is, with a long
 * stale-while-revalidate so a crawler never waits on a cold instance.
 */
export const FEED_CACHE_CONTROL = "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";
