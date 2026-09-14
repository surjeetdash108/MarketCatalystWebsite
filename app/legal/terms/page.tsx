import type { Metadata } from "next";
import { LegalPending } from "@/components/marketing/LegalPending";

export const metadata: Metadata = {
  title: "Terms of service — MarketCatalyst",
  description: "The terms governing use of MarketCatalyst.",
  alternates: { canonical: "/legal/terms" },
  // Not indexable until the real text is published — an empty legal page in
  // search results is worse than none.
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPending
      title="Terms of service"
      summary="The terms governing your use of MarketCatalyst."
    />
  );
}
