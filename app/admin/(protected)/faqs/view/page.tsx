import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getFaqById } from "@/lib/faq/faqs";

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminViewFaqPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const id = firstParam((await searchParams).id);
  if (!id) redirect("/admin/faqs");

  const faq = await getFaqById(id);
  if (!faq) notFound();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <h1 className="a-h1">FAQ</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/admin/faqs/edit?id=${faq.id}`} className="btn primary">Edit</Link>
          <Link href={`/faqs/view?id=${faq.id}`} target="_blank" rel="noreferrer" className="btn">Open public ↗</Link>
          <Link href="/admin/faqs" className="btn">Back</Link>
        </div>
      </div>

      <div className="a-panel" style={{ padding: 18 }}>
        <div className="a-muted" style={{ marginBottom: 8 }}>Updated {new Date(faq.updatedAt).toLocaleString()}</div>
        <h2 style={{ color: "var(--text-hi)", fontWeight: 700, fontSize: "1.15rem", marginBottom: 10 }}>{faq.question}</h2>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "var(--text)" }}>{faq.answer}</div>
      </div>
    </div>
  );
}
