import { z } from "zod";

// Deliberately no `role` field — inviteEditor always grants role: "editor"
// server-side. There is no client-reachable way to request a role, which
// removes UI-driven privilege escalation as a class of bug rather than
// merely checking against it at runtime.
export const inviteEditorSchema = z.object({
  email: z.string().trim().email("Enter a valid email address").max(320),
  displayName: z.string().trim().max(200).optional().or(z.literal("")),
});

export type InviteEditorInput = z.infer<typeof inviteEditorSchema>;

export const userIdSchema = z.object({
  uid: z.string().trim().min(1),
});
