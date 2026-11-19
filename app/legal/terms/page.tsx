import type { Metadata } from "next";
import { TermsOfService } from "@/components/marketing/TermsOfService";
import { pageMetadata } from "@/lib/seo/og";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service | MarketCatalyst",
  description:
    "The terms for using MarketCatalyst: our research is not investment advice, plus accounts, acceptable use, subscriptions and billing, and liability.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return <TermsOfService />;
}