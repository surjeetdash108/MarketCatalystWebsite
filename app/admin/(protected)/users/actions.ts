"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/rbac";
import { inviteEditorSchema, userIdSchema } from "@/lib/validation/users";
import { adminAuth } from "@/lib/firebase/admin";
import { upsertMemberDoc, removeMember } from "@/lib/auth/members";

export type ActionState = { error?: string } | null;

/**
 * Always grants role: "EDITOR". There is no parameter, form field, or code
 * path anywhere in this app that lets a caller — including an admin acting
 * through a compromised/buggy client — request role: "ADMIN" here.
 * Becoming an admin only happens via scripts/seed-admin.ts, run locally.
 */
export async function inviteEditorAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = inviteEditorSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    displayName: String(formData.get("displayName") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_input" };
  }

  const { email, displayName } = parsed.data;

  let userRecord;
  try {
    userRecord = await adminAuth.getUserByEmail(email);
  } catch {
    userRecord = await adminAuth.createUser({ email, displayName: displayName || undefined });
  }

  await upsertMemberDoc({
    uid: userRecord.uid,
    email,
    displayName: displayName || null,
    role: "EDITOR",
    invitedBy: admin.uid,
  });

  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/login`,
  };
  const resetLink = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

  // TODO: send `resetLink` via a transactional email provider. Logged here
  // for now so an invite is still actionable during initial rollout.
  console.info(`[inviteEditorAction] password set link for ${email}: ${resetLink}`);

  revalidatePath("/admin/users");
  return { error: undefined };
}

/**
 * Deletes a website_members doc, which is what actually gates admin-UI
 * access (see lib/auth/session.ts) — the Firebase Auth account itself is
 * left alone. Self-removal is blocked outright: an admin deleting their own
 * doc would strand the account with a live session but no seat left able to
 * grant access back to anyone, including itself.
 */
export async function removeMemberAction(uid: string): Promise<void> {
  const admin = await requireAdmin();
  const parsed = userIdSchema.safeParse({ uid });
  if (!parsed.success) throw new Error("invalid_input");

  if (parsed.data.uid === admin.uid) {
    throw new Error("cannot_remove_self");
  }

  await adminAuth.revokeRefreshTokens(parsed.data.uid);
  await removeMember(parsed.data.uid);

  revalidatePath("/admin/users");
}
