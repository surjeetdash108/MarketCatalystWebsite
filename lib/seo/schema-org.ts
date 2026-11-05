// The site-wide schema.org graph (Organization + WebSite), emitted in every page's <head>.
// Shared by app/layout.tsx and lib/landing/home-document.ts, the home page being a
// static document that does not go through the layout.
export const SCHEMA_ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://marketcatalyst.ai/#organization",
      "name": "MarketCatalyst",
      "url": "https://marketcatalyst.ai",
      "description":
        "MarketCatalyst is an AI-powered market intelligence platform for market research, combining market data, news, earnings, analyst actions, macroeconomic events, filings, ownership data, screeners and AI-powered market summaries in one platform.",
      "logo": {
        "@type": "ImageObject",
        "@id": "https://marketcatalyst.ai/#logo",
        "url": "https://marketcatalyst.ai/logo.png",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://marketcatalyst.ai/#website",
      "url": "https://marketcatalyst.ai",
      "name": "MarketCatalyst",
      "description":
        "AI-powered market intelligence and stock market research platform.",
      "publisher": {
        "@id": "https://marketcatalyst.ai/#organization",
      },
      "inLanguage": "en-US",
    },
    // No SoftwareApplication here. It was on every page, and Google requires
    // `offers` plus `aggregateRating` or `review` on that type, so all 39
    // audited pages errored. The product is described on /features, with its
    // price list (buildFeaturesJsonLd in lib/seo/jsonld.ts).
  ],
};
