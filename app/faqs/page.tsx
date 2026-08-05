import type { Metadata } from "next";
import Link from "next/link";
import { getPublicFaqs } from "@/lib/faq/faqs";

// Rendered per-request (App Hosting, not a static export) so the build never
// depends on Firestore being reachable.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "FAQs — MarketCatalyst",
  description: "Frequently asked questions about MarketCatalyst.",
  alternates: { canonical: "/faqs" },
};

export default async function FaqsIndexPage() {
  const faqs = await getPublicFaqs();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="a-h1">FAQs</h1>

      <div className="a-panel" style={{ padding: "6px 14px" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Question</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td>
                  <Link href={`/faqs/view?id=${faq.id}`} style={{ color: "var(--text-hi)", fontWeight: 600 }}>
                    {faq.question}
                  </Link>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td className="a-muted" style={{ textAlign: "center", padding: "24px 0" }}>
                  No FAQs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
