import { sectionOfType } from "@/lib/blog/sections";
import { getLivePostSummaries } from "@/lib/blog/posts";
import { FEED_CACHE_CONTROL, postDate, postUpdated, siteUrl, WEBSUB_HUB_URL, xmlEscape } from "@/lib/seo/feeds";
import { resolvePostSeoDescription } from "@/lib/seo/jsonld";
import { postPath } from "@/lib/seo/shortened-posts";

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

  // When the feed last changed: the latest edit among the posts it lists, not the
  // newest post's publish date, so an edit to an older post moves it too.
  const newest = posts.reduce<Date | undefined>((latest, post) => {
    const at = postUpdated(post);
    return !latest || at > latest ? at : latest;
  }, undefined) ?? new Date();

  const items = posts
    .map((post) => {
      const link = `${base}${postPath(post.slug)}`;
      const description = resolvePostSeoDescription(post);
      return [
        "    <item>",
        `      <title>${xmlEscape(post.title)}</title>`,
        `      <link>${xmlEscape(link)}</link>`,
        `      <guid isPermaLink="true">${xmlEscape(link)}</guid>`,
        `      <pubDate>${postDate(post).toUTCString()}</pubDate>`,
        `      <atom:updated>${postUpdated(post).toISOString()}</atom:updated>`,
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
    <link>${xmlEscape(base)}</link>
    <atom:link href="${xmlEscape(base)}/feed.xml" rel="self" type="application/rss+xml" />
    <atom:link href="${xmlEscape(WEBSUB_HUB_URL)}" rel="hub" />
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
