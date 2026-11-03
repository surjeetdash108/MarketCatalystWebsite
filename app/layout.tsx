import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/og";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import "./globals.css";
import "./theme.css";
import "./chrome.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://marketcatalyst.ai"),
  title: "MarketCatalyst — Market Intelligence Terminal",
  description:
    "From ticker to thesis in under 60 seconds. Earnings, movers, analyst actions, insider flows and your portfolio — all in one terminal.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://marketcatalyst.ai",
    siteName: "MarketCatalyst",
    title: "MarketCatalyst — Market Intelligence Terminal",
    description:
      "From ticker to thesis in under 60 seconds. Earnings, movers, analyst actions, insider flows and your portfolio — all in one terminal.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketCatalyst — Market Intelligence Terminal",
    description:
      "From ticker to thesis in under 60 seconds. Earnings, movers, analyst actions, insider flows and your portfolio — all in one terminal.",
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
};

const schemaOrgJsonLd = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Feed discovery for readers and aggregators. A plain <link> rather than
            metadata `alternates.types`: every page that sets its own `alternates`
            (for its canonical) would replace the parent's, dropping this. */}
        <link rel="alternate" type="application/rss+xml" title="MarketCatalyst" href="/feed.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrgJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleTagManager />
        {children}
      </body>
    </html>
  );
}
