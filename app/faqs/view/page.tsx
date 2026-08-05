import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getFaqById } from "@/lib/faq/faqs";

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
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/faqs" className="btn sm">← All FAQs</Link>
      </div>

      <article className="a-panel" style={{ padding: 24 }}>
        <h1 className="a-h1" style={{ fontSize: "1.5rem", lineHeight: 1.3 }}>{faq.question}</h1>
        <div style={{ marginTop: 16, whiteSpace: "pre-wrap", lineHeight: 1.7, color: "var(--text)" }}>
          {faq.answer}
        </div>
      </article>
    </div>
  );
}
