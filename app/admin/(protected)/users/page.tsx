import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { listMembers } from "@/lib/auth/members";
import { InviteEditorForm } from "@/components/admin/InviteEditorForm";
import { UsersTable } from "@/components/admin/UsersTable";

export default async function AdminUsersPage() {
  const user = await getSessionUser();
  // Belt-and-suspenders: the sidebar link is admin-only and every mutating
  // action re-checks requireAdmin(), but a curious editor navigating here
  // directly should still see a redirect, not a leaked table of accounts.
  if (!user || user.role !== "ADMIN") {
    redirect("/admin/faqs");
  }

  const members = await listMembers();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="a-h1">Members</h1>
      <InviteEditorForm />
      <UsersTable members={members} currentUid={user.uid} />
    </div>
  );
}
