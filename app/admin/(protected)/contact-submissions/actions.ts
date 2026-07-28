"use server";

import { revalidatePath } from "next/cache";
import { requireEditorOrAdmin } from "@/lib/auth/rbac";
import { setSubmissionStatus, type SubmissionStatus } from "@/lib/contact/submissions";

export async function setSubmissionStatusAction(id: string, status: SubmissionStatus): Promise<void> {
  await requireEditorOrAdmin();
  await setSubmissionStatus(id, status);
  revalidatePath("/admin/contact-submissions");
}
