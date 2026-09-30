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
