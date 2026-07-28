import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/admin/LogoutButton";

// This re-verifies the session server-side via the Admin SDK (Node.js
// runtime) even though middleware already fast-pathed a redirect for
// requests with no cookie at all — middleware only checks cookie
// *presence* (it runs on the Edge runtime, which can't load Admin SDK), so
// this layout is the first point that actually verifies the cookie and the
// user's role. Never treat middleware's check as sufficient on its own.
export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-neutral-200 p-4">
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin/posts" className="rounded px-2 py-1.5 hover:bg-neutral-100">
            Posts
          </Link>
          <Link href="/admin/media" className="rounded px-2 py-1.5 hover:bg-neutral-100">
            Media
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin/users" className="rounded px-2 py-1.5 hover:bg-neutral-100">
              Editors
            </Link>
          )}
          <Link href="/admin/contact-submissions" className="rounded px-2 py-1.5 hover:bg-neutral-100">
            Contact submissions
          </Link>
        </nav>
        <div className="mt-8 flex flex-col gap-2 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
          <span>{user.email}</span>
          <span className="uppercase tracking-wide">{user.role}</span>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
