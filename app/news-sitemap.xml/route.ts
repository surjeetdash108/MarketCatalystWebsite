import { getLivePostSummaries } from "@/lib/blog/posts";
import { FEED_CACHE_CONTROL, postDate, siteUrl, xmlEscape } from "@/lib/seo/feeds";

/**
 * Google News sitemap at /news-sitemap.xml: posts published in the last 48
 * hours, with the news: namespace Google News reads (publication, date, title).
 *
 * Google only looks at articles from the last two days, so older posts are left
 * out on purpose; they stay in /sitemap.xml. With nothing recent the file is a
 * valid, empty <urlset>.
 */
export const dynamic = "force-dynamic";

const WINDOW_MS = 48 * 60 * 60 * 1000;
/** Google's limit for one news sitemap. */
const MAX_URLS = 1000;

export async function GET() {
  const base = siteUrl();
  let recent: Awaited<ReturnType<typeof getLivePostSummaries>> = [];
  try {
    const cutoff = Date.now() - WINDOW_MS;
    recent = (await getLivePostSummaries()).filter((p) => postDate(p).getTime() >= cutoff).slice(0, MAX_URLS);
  } catch (err) {
    console.error("news-sitemap.xml: failed to load posts", err);
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "Retry-After": "300" } });
  }

  const urls = recent
    .map((post) =>
      [
        "  <url>",
        `    <loc>${xmlEscape(`${base}/posts/${encodeURIComponent(post.slug)}`)}</loc>`,
        "    <news:news>",
        "      <news:publication>",
        "        <news:name>MarketCatalyst</news:name>",
        "        <news:language>en</news:language>",
        "      </news:publication>",
        `      <news:publication_date>${postDate(post).toISOString()}</news:publication_date>`,
        `      <news:title>${xmlEscape(post.title)}</news:title>`,
        "    </news:news>",
        "  </url>",
      ].join("\n"),
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": FEED_CACHE_CONTROL,
    },
  });
}
