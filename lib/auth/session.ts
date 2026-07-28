import "server-only";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { getMember } from "./members";
import { SESSION_COOKIE_NAME } from "./constants";
import type { MemberRole } from "./constants";

export type SessionUser = {
  uid: string;
  email: string;
  role: MemberRole;
};

/**
 * The single source of truth for "who is the currently authenticated
 * admin/editor". Every Server Action, Route Handler, and layout must call
 * this directly rather than re-implementing cookie/lookup verification —
 * duplicating this check is how auth bugs get introduced.
 *
 * Firebase Auth (the session cookie) only proves identity. Authorization —
 * whether this identity has any admin-UI access at all, and what role —
 * comes exclusively from the website_members Firestore doc. A valid,
 * unrevoked session for a uid with no website_members doc is treated
 * identically to no session.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!decoded.email) return null;

    const member = await getMember(decoded.uid);
    if (!member) return null;

    return { uid: decoded.uid, email: decoded.email, role: member.role };
  } catch {
    // Expired, revoked, or malformed cookie — treat identically to "no session".
    return null;
  }
}
