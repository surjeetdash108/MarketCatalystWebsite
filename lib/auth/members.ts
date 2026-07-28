import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { isMemberRole, type MemberRole } from "./constants";

// website_members is the sole source of truth for admin-UI access and role.
// Firebase Auth (adminAuth in lib/firebase/admin) is used only to
// authenticate *who* someone is — it never carries a role. A Firebase Auth
// account with no matching doc here gets zero admin-UI access, full stop.
export type WebsiteMember = {
  uid: string;
  email: string;
  displayName: string | null;
  role: MemberRole;
  invitedBy: string | null;
  createdAt: string;
};

const WEBSITE_MEMBERS = "website_members";

function mapMember(uid: string, data: FirebaseFirestore.DocumentData): WebsiteMember | null {
  if (!isMemberRole(data.role)) return null;
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    uid,
    email: data.email,
    displayName: data.displayName ?? null,
    role: data.role,
    invitedBy: data.invitedBy ?? null,
    createdAt: createdAt ? createdAt.toDate().toISOString() : new Date(0).toISOString(),
  };
}

/**
 * The single lookup every session check goes through (lib/auth/session.ts).
 * No doc here means no access — this is the actual authorization gate, not
 * a denormalized read-model.
 */
export async function getMember(uid: string): Promise<WebsiteMember | null> {
  const doc = await adminFirestore.collection(WEBSITE_MEMBERS).doc(uid).get();
  if (!doc.exists) return null;
  return mapMember(doc.id, doc.data()!);
}

export async function listMembers(): Promise<WebsiteMember[]> {
  const snap = await adminFirestore.collection(WEBSITE_MEMBERS).orderBy("createdAt", "desc").get();
  return snap.docs
    .map((doc) => mapMember(doc.id, doc.data()))
    .filter((member): member is WebsiteMember => member !== null);
}

export async function upsertMemberDoc(params: {
  uid: string;
  email: string;
  displayName: string | null;
  role: MemberRole;
  invitedBy: string | null;
}): Promise<void> {
  await adminFirestore
    .collection(WEBSITE_MEMBERS)
    .doc(params.uid)
    .set(
      {
        email: params.email,
        displayName: params.displayName,
        role: params.role,
        invitedBy: params.invitedBy,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function removeMember(uid: string): Promise<void> {
  await adminFirestore.collection(WEBSITE_MEMBERS).doc(uid).delete();
}
