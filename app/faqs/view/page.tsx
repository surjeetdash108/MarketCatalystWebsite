import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getFaqById } from "@/lib/faq/faqs";
import { ReaderShell } from "@/components/chrome/ReaderShell";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import "../../pages.css";

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}): Promise<Metadata> {
  const id = firstParam((await searchParams).id);
  if (!id) return {};
  const faq = await getFaqById(id);
  if (!faq) return {};
  return {
    title: `${faq.question} — MarketCatalyst FAQ`,
    description: faq.answer.slice(0, 160),
    alternates: { canonical: `/faqs/view?id=${faq.id}` },
  };
}

// A single answer, deep-linkable. Same chrome as the board it came from —
// this used to sit on the admin console's surface, which made a public page
// look like someone's back office.
export default async function FaqViewPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const id = firstParam((await searchParams).id);
  if (!id) redirect("/faqs");

  const faq = await getFaqById(id);
  if (!faq) notFound();

  return (
    <ReaderShell active="faqs">
      <main>
        <section className="mcp-hero">
          <div className="mcp-glow" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>

          <div className="mcp-inner" style={{ maxWidth: 820 }}>
            <Link className="mcp-back mc-rev" href="/faqs">
              <i>←</i> All FAQs
            </Link>
            <h1 className="mcp-h1 mcp-h1-sm mc-rev">{faq.question}</h1>
            <div className="mcp-answer mc-rev mc-rev-sm">{faq.answer}</div>

            <div className="mcp-actions mc-rev mc-rev-sm">
              <a className="mcp-cta" href={APP_SIGNUP_URL}>
                Open the terminal <i>→</i>
              </a>
              <Link className="mcp-cta-ghost" href="/contact">
                Ask something else
              </Link>
            </div>
          </div>
        </section>
      </main>
    </ReaderShell>
  );
}
