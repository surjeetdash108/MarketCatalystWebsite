import type { Metadata } from "next";
import { PrivacyPolicy } from "@/components/marketing/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy | MarketCatalyst",
  description: "Privacy Policy for MarketCatalyst.",
  alternates: { canonical: "/legal/privacy" },
};

export default function PrivacyPage() {
  return <PrivacyPolicy />;
}