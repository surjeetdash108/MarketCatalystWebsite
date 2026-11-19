import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/marketing/PrivacyPolicy";
import { pageMetadata } from "@/lib/seo/og";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | MarketCatalyst",
  description:
    "How MarketCatalyst collects, uses and shares your personal data, how long we keep it, and the privacy rights you have under US state law.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}