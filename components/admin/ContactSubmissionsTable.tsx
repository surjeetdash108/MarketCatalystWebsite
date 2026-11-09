"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSubmissionStatusAction } from "@/app/admin/(protected)/contact-submissions/actions";
import type { ContactSubmission } from "@/lib/contact/submissions";

// Fixed locale + UTC so the server render and the browser hydrate to the same
// text. A missing createdAt maps to the epoch (see mapSubmission), so hide it.
function receivedAt(iso: string): string | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime()) || date.getTime() === 0) return null;
  return `${date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}

export function ContactSubmissionsTable({ submissions }: { submissions: ContactSubmission[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(id: string, status: "new" | "read" | "archived") {
    startTransition(async () => {
      await setSubmissionStatusAction(id, status);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {submissions.map((submission) => (
        <div key={submission.id} className="a-panel">
          <div className="flex items-center justify-between">
            <div>
              <span style={{ fontWeight: 600, color: "var(--text-hi)" }}>{submission.name}</span>{" "}
              <span className="a-muted">&lt;{submission.email}&gt;</span>
            </div>
            <span className={`pill ${submission.status === "new" ? "opt" : "flat"}`}>{submission.status}</span>
          </div>
          <div className="a-muted" style={{ marginTop: 6, fontSize: 12 }}>
            <span>Company: {submission.company ?? "—"}</span>
            {receivedAt(submission.createdAt) && <span> · Received {receivedAt(submission.createdAt)}</span>}
          </div>
          <p className="a-muted" style={{ marginTop: 8, whiteSpace: "pre-wrap", color: "var(--text)" }}>{submission.message}</p>
          <div className="mt-3 flex gap-2">
            <button disabled={pending} onClick={() => setStatus(submission.id, "read")} className="btn sm" style={{ opacity: pending ? 0.5 : 1 }}>
              Mark read
            </button>
            <button disabled={pending} onClick={() => setStatus(submission.id, "archived")} className="btn sm" style={{ opacity: pending ? 0.5 : 1 }}>
              Archive
            </button>
          </div>
        </div>
      ))}
      {submissions.length === 0 && <p className="a-muted">No submissions yet.</p>}
    </div>
  );
}
