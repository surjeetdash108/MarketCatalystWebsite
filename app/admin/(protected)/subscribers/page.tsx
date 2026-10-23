import { requireEditorOrAdmin } from "@/lib/auth/rbac";
import { listSubscribers } from "@/lib/newsletter/subscribers";

export const dynamic = "force-dynamic";

/** Daily-recap signups from the "Get the recap" box on /posts. */
export default async function SubscribersPage() {
  await requireEditorOrAdmin();
  const subscribers = await listSubscribers();
  const active = subscribers.filter((s) => s.status === "active");

  return (
    <div className="flex flex-col gap-4">
      <h1 className="a-h1">Recap subscribers</h1>
      <p className="a-muted">
        {active.length} active · signups from the “Get the recap” box on /posts.
      </p>
      <div className="flex flex-col gap-2">
        {subscribers.map((s) => (
          <div key={s.id} className="a-panel flex items-center justify-between">
            <span style={{ fontWeight: 600, color: "var(--text-hi)" }}>{s.email}</span>
            <span className="a-muted">
              {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" })}
              {s.source ? ` · ${s.source}` : ""}
              {s.status === "unsubscribed" ? " · unsubscribed" : ""}
            </span>
          </div>
        ))}
        {subscribers.length === 0 && <p className="a-muted">No subscribers yet.</p>}
      </div>
    </div>
  );
}
