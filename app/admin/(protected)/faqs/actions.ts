"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditorOrAdmin } from "@/lib/auth/rbac";
import { createFaqSchema, updateFaqSchema, deleteFaqSchema } from "@/lib/validation/faq";
import { createFaq, updateFaq, deleteFaq } from "@/lib/faq/faqs";

export type ActionState = { error?: string } | null;

export async function createFaqAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireEditorOrAdmin();

  const parsed = createFaqSchema.safeParse({
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_input" };
  }

  const faq = await createFaq(parsed.data, user.uid);
  revalidatePath("/admin/faqs");
  revalidatePath("/faqs");
  redirect(`/admin/faqs/edit?id=${faq.id}`);
}

export async function updateFaqAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireEditorOrAdmin();

  const parsed = updateFaqSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_input" };
  }

  await updateFaq(parsed.data, user.uid);
  revalidatePath("/admin/faqs");
  revalidatePath("/faqs");
  return { error: undefined };
}

export async function deleteFaqAction(id: string): Promise<void> {
  await requireEditorOrAdmin();
  const parsed = deleteFaqSchema.safeParse({ id });
  if (!parsed.success) throw new Error("invalid_input");

  await deleteFaq(parsed.data.id);
  revalidatePath("/admin/faqs");
  revalidatePath("/faqs");
}
