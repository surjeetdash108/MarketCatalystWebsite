"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setSubmissionStatusAction } from "@/app/admin/(protected)/contact-submissions/actions";
import type { ContactSubmission } from "@/lib/contact/submissions";

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
        <div key={submission.id} className="rounded border border-neutral-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">{submission.name}</span>{" "}
              <span className="text-sm text-neutral-500">&lt;{submission.email}&gt;</span>
            </div>
            <span className="text-xs uppercase tracking-wide text-neutral-500">{submission.status}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">{submission.message}</p>
          <div className="mt-3 flex gap-2 text-xs">
            <button
              disabled={pending}
              onClick={() => setStatus(submission.id, "read")}
              className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-50"
            >
              Mark read
            </button>
            <button
              disabled={pending}
              onClick={() => setStatus(submission.id, "archived")}
              className="rounded border border-neutral-300 px-2 py-1 disabled:opacity-50"
            >
              Archive
            </button>
          </div>
        </div>
      ))}
      {submissions.length === 0 && <p className="text-sm text-neutral-500">No submissions yet.</p>}
    </div>
  );
}
