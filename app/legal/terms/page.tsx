import type { Metadata } from "next";
import { TermsOfService } from "@/components/marketing/TermsOfService";
import { pageMetadata } from "@/lib/seo/og";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service | MarketCatalyst",
  description:
    "Terms of Service for MarketCatalyst.",
  path: "/legal/terms",
});

export default function TermsPage() {
  return <TermsOfService />;
}