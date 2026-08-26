import type { Metadata } from "next";
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
      <div>
        <h1 className="a-h1">Frequently asked questions</h1>
        <p className="a-muted" style={{ marginTop: 6 }}>
          Everything about the MarketCatalyst terminal, its data, and its tools. Tap a question to expand.
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="a-panel a-muted" style={{ padding: 32, textAlign: "center" }}>
          No FAQs yet.
        </div>
      ) : (
        <div className="faq-list">
          {/* Shared `name` on every <details> makes them an exclusive accordion:
              opening one collapses any other open item (native HTML, no JS). */}
          {faqs.map((faq) => (
            <details key={faq.id} name="faq-accordion" className="faq-item">
              <summary className="faq-q">
                <span>{faq.question}</span>
                <svg className="faq-chevron" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <div className="faq-a">{faq.answer}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
