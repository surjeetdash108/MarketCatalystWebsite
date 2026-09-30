import type { Metadata } from "next";

/**
 * The site-wide link-preview image (public/og-image.jpg, 1200x630). The root
 * layout sets it for every page that does not bring its own, and blog posts
 * fall back to it when they have no cover image.
 */
export const DEFAULT_OG_IMAGE = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "MarketCatalyst: stock market research, from ticker to thesis",
};

/**
 * Metadata for a public page, with its link preview built from the same title
 * and description. Next merges `openGraph` and `twitter` shallowly, so a page
 * that sets only `title`/`description` would otherwise share the homepage's
 * preview title, description and URL.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "MarketCatalyst",
      url: path,
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}
