import "server-only";
import { getSessionUser, type SessionUser } from "./session";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Every Server Action / Route Handler mutation must call one of these as
 * its first line, before touching Firestore. Middleware and the admin
 * layout already gate page navigation, but neither is sufficient alone —
 * a route added outside the middleware matcher, or a future refactor that
 * disables it, must not silently open up a mutation. uid/role are always
 * re-derived here from the verified session cookie, never trusted from
 * client-submitted form/JSON data.
 */
export async function requireEditorOrAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

/**
 * Stricter check for admin-only actions (inviting/removing members).
 * There is deliberately no action anywhere in this codebase that lets an
 * editor request role: "ADMIN" for themselves or anyone else — becoming an
 * admin only happens via scripts/seed-admin.ts, run locally.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") throw new UnauthorizedError();
  return user;
}
