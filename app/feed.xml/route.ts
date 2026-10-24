import { sectionOfType } from "@/lib/blog/sections";
import { getLivePostSummaries } from "@/lib/blog/posts";
import { FEED_CACHE_CONTROL, postDate, siteUrl, xmlEscape } from "@/lib/seo/feeds";
import { resolvePostSeoDescription } from "@/lib/seo/jsonld";

/**
 * RSS 2.0 feed of the latest 50 posts, at /feed.xml.
 *
 * The standard way for readers, aggregators, Google News and Discover to pick
 * up a daily publication quickly. Built on request from the cached post list,
 * for the same reason app/sitemap.ts is: a prerendered feed would freeze at the
 * last deploy.
 */
export const dynamic = "force-dynamic";

const LIMIT = 50;

export async function GET() {
  const base = siteUrl();
  let posts: Awaited<ReturnType<typeof getLivePostSummaries>> = [];
  try {
    posts = (await getLivePostSummaries()).slice(0, LIMIT);
  } catch (err) {
    // A feed reader treats an error as "try later"; an empty feed would be read
    // as "everything was deleted". Fail loudly instead.
    console.error("feed.xml: failed to load posts", err);
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }

  const newest = posts[0] ? postDate(posts[0]) : new Date();

  const items = posts
    .map((post) => {
      const link = `${base}/posts/${encodeURIComponent(post.slug)}`;
      const description = resolvePostSeoDescription(post);
      return [
        "    <item>",
        `      <title>${xmlEscape(post.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        `      <pubDate>${postDate(post).toUTCString()}</pubDate>`,
        `      <category>${xmlEscape(sectionOfType(post.type))}</category>`,
        description ? `      <description>${xmlEscape(description)}</description>` : null,
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MarketCatalyst</title>
    <link>${xmlEscape(base)}/posts</link>
    <atom:link href="${xmlEscape(base)}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Daily recaps, research and guides to how the market actually works.</description>
    <language>en-us</language>
    <lastBuildDate>${newest.toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": FEED_CACHE_CONTROL,
    },
  });
}
