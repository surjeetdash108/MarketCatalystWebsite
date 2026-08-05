import { redirect } from "next/navigation";

// The edit page moved to /admin/edit?id=<id>. Redirect the old nested route so
// any bookmarked links keep working.
export default async function LegacyEditRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/edit?id=${id}`);
}
