export const SESSION_COOKIE_NAME = "mc_admin_session";

// Shorter than Firebase's 14-day maximum — appropriate for a small internal
// admin/editor user base where forcing periodic re-login is an acceptable
// tradeoff for a smaller session-hijack window.
export const SESSION_EXPIRES_IN_MS = 5 * 24 * 60 * 60 * 1000;

export const MEMBER_ROLES = ["ADMIN", "EDITOR"] as const;
export type MemberRole = (typeof MEMBER_ROLES)[number];

export function isMemberRole(value: unknown): value is MemberRole {
  return typeof value === "string" && (MEMBER_ROLES as readonly string[]).includes(value);
}
