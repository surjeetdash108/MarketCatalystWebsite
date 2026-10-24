import type { MetadataRoute } from "next";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    // The news sitemap and the RSS feed are push channels for new posts; Google
    // reads an RSS 2.0 feed as a sitemap, so both are listed here.
    sitemap: [`${base}/sitemap.xml`, `${base}/news-sitemap.xml`, `${base}/feed.xml`],
  };
}
