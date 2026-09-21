import type { Metadata } from "next";
import { TermsOfService } from "@/components/marketing/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service | MarketCatalyst",
  description: "Terms of Service for MarketCatalyst.",
  alternates: { canonical: "/legal/terms" },
};

export default function TermsPage() {
  return <TermsOfService />;
}