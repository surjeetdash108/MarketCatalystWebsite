import type { Metadata } from "next";
import { LegalPending } from "@/components/marketing/LegalPending";

export const metadata: Metadata = {
  title: "Privacy policy — MarketCatalyst",
  description: "How MarketCatalyst handles your personal data.",
  alternates: { canonical: "/legal/privacy" },
  // Not indexable until the real text is published.
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPending
      title="Privacy policy"
      summary="What personal data MarketCatalyst collects, why, and what happens to it."
    />
  );
}
