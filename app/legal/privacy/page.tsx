import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/marketing/PrivacyPolicy";
import { pageMetadata } from "@/lib/seo/og";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy | MarketCatalyst",
  description:
    "Privacy Policy for MarketCatalyst.",
  path: "/legal/privacy",
});

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}