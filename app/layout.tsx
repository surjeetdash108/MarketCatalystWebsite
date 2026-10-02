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
};

const schemaOrgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://marketcatalyst.ai/#organization",
      "name": "MarketCatalyst",
      "url": "https://marketcatalyst.ai/",
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
      "url": "https://marketcatalyst.ai/",
      "name": "MarketCatalyst",
      "description":
        "AI-powered market intelligence and stock market research platform.",
      "publisher": {
        "@id": "https://marketcatalyst.ai/#organization",
      },
      "inLanguage": "en-US",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://marketcatalyst.ai/#software",
      "name": "MarketCatalyst",
      "url": "https://marketcatalyst.ai/",
      "applicationCategory": "FinanceApplication",
      "applicationSubCategory": "Investment Research",
      "operatingSystem": "Web",
      "description":
        "AI-powered market intelligence platform providing market research, market data, news, earnings analysis, analyst actions, macroeconomic data, screeners, ownership data, ETF research, market recaps, portfolios and watchlists.",
      "publisher": {
        "@id": "https://marketcatalyst.ai/#organization",
      },
    },
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
