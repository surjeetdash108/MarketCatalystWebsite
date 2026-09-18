import type { Metadata } from "next";
import { getPublicFaqs } from "@/lib/faq/faqs";
import { ReaderShell } from "@/components/chrome/ReaderShell";
import { FaqBoard } from "@/components/faq/FaqBoard";
import "../pages.css";

// Rendered per-request (App Hosting, not a static export) so the build never
// depends on Firestore being reachable.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQs — MarketCatalyst",
  description:
    "Frequently asked questions about the MarketCatalyst terminal: where the data comes from, what the platform does, and what it deliberately does not do.",
  alternates: { canonical: "/faqs" },
};

export default async function FaqsIndexPage() {
  const faqs = await getPublicFaqs();

  return (
    <ReaderShell active="faqs">
      <FaqBoard faqs={faqs} />
    </ReaderShell>
  );
}
