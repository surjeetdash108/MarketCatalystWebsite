import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { AdminNav } from "@/components/admin/AdminNav";
import { BrandLogo } from "@/components/admin/BrandLogo";
import "../admin.css";

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

  const initials = (user.email ?? "?").slice(0, 2).toUpperCase();

  return (
    <div className="iq-root" data-theme="dark" style={{ height: "100vh", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "236px 1fr", height: "100vh", position: "relative", zIndex: 1 }}>
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "18px 14px",
            borderRight: "1px solid var(--border)",
            background: "var(--surface-0)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 6px 18px" }}>
            <BrandLogo height={24} />
            <span style={{ fontSize: 9, letterSpacing: ".18em", color: "var(--text-dim-solid)", fontWeight: 600, border: "1px solid var(--border)", borderRadius: 5, padding: "2px 6px" }}>
              ADMIN
            </span>
          </div>

          <div style={{ fontSize: 10, letterSpacing: ".16em", color: "var(--text-dim-solid)", padding: "6px 10px 4px", fontWeight: 600 }}>
            MANAGE
          </div>
          <AdminNav role={user.role} />

          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 8px 4px", borderTop: "1px solid var(--border-soft)" }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: "var(--surface-3)",
                display: "grid",
                placeItems: "center",
                color: "var(--brand-2)",
                fontWeight: 600,
                fontSize: 12,
                flex: "none",
              }}
            >
              {initials}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 12.5, color: "var(--text-hi)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
              <div style={{ fontSize: 10.5, color: "var(--text-dim-solid)", letterSpacing: ".08em" }}>{user.role}</div>
            </div>
          </div>
          <div style={{ padding: "8px 4px 0" }}>
            <LogoutButton />
          </div>
        </aside>

        <main style={{ overflowY: "auto", minWidth: 0, background: "var(--bg)" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 26px",
              borderBottom: "1px solid var(--border)",
              background: "color-mix(in srgb, var(--bg) 92%, transparent)",
              backdropFilter: "blur(8px)",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: "var(--text-hi)" }}>Admin</h1>
          </div>
          <div style={{ padding: "22px 26px 60px" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
