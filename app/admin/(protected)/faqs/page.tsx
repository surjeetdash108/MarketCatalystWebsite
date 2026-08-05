import Link from "next/link";
import { getAllFaqsForAdmin } from "@/lib/faq/faqs";
import { DeleteFaqButton } from "@/components/admin/DeleteFaqButton";

export const dynamic = "force-dynamic";

export default async function AdminFaqsPage() {
  const faqs = await getAllFaqsForAdmin();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="a-h1">FAQs</h1>
        <Link href="/admin/faqs/new" className="btn primary">New FAQ</Link>
      </div>

      <div className="a-panel" style={{ padding: "6px 14px" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Question</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq) => (
              <tr key={faq.id}>
                <td>
                  <Link href={`/admin/faqs/view?id=${faq.id}`} style={{ color: "var(--text-hi)", fontWeight: 600 }}>
                    {faq.question}
                  </Link>
                </td>
                <td className="a-muted" style={{ whiteSpace: "nowrap" }}>{new Date(faq.updatedAt).toLocaleString()}</td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <Link href={`/admin/faqs/view?id=${faq.id}`} className="btn sm" style={{ marginRight: 6 }}>View</Link>
                  <Link href={`/admin/faqs/edit?id=${faq.id}`} className="btn sm" style={{ marginRight: 6 }}>Edit</Link>
                  <DeleteFaqButton id={faq.id} />
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan={3} className="a-muted" style={{ textAlign: "center", padding: "24px 0" }}>
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
