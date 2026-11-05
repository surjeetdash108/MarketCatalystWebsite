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
 * The date a post last changed: `updatedAt`, which only an edit or a status
 * change moves (reader tracking writes elsewhere), and the same value the
 * sitemap's lastmod and the article's dateModified use. Never earlier than the
 * go-live date, so a post with no usable `updatedAt` reports that instead of 1970.
 */
export function postUpdated(post: PostSummary): Date {
  const live = postDate(post);
  const edited = new Date(post.updatedAt);
  return edited > live ? edited : live;
}

/**
 * The WebSub hub /feed.xml names (`<atom:link rel="hub">`) — the public one
 * Google runs. The backend's websub-ping job (MarketCatalystBackEnd,
 * src/sync/websub-ping.job.ts) POSTs to the same hub when a post goes live, so
 * change them together.
 */
export const WEBSUB_HUB_URL = "https://pubsubhubbub.appspot.com/";

/**
 * Headers for a feed response. Public and cacheable at the CDN for five minutes,
 * which is as stale as the post cache behind it already is, with a long
 * stale-while-revalidate so a crawler never waits on a cold instance.
 */
export const FEED_CACHE_CONTROL = "public, max-age=300, s-maxage=300, stale-while-revalidate=86400";
