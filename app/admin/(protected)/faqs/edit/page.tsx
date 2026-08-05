import { notFound, redirect } from "next/navigation";
import { getFaqById } from "@/lib/faq/faqs";
import { FaqEditor } from "@/components/admin/FaqEditor";

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminEditFaqPage({
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
      <h1 className="a-h1">Edit FAQ</h1>
      <FaqEditor faq={faq} />
    </div>
  );
}
