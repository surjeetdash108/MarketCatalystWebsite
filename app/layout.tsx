import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";
import "./iq.css";
import "./landing.css";

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
  },
  twitter: {
    card: "summary_large_image",
    title: "MarketCatalyst — Market Intelligence Terminal",
    description:
      "From ticker to thesis in under 60 seconds. Earnings, movers, analyst actions, insider flows and your portfolio — all in one terminal.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
