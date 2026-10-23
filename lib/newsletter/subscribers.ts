import "server-only";
import { createHash } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";

export type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  status: "active" | "unsubscribed";
  createdAt: string;
  lastSignupAt: string;
};

const COLLECTION = "newsletterSubscribers";

/** One doc per address (id = hash of the lowercased email), so a repeat
 *  signup updates the same subscriber instead of adding a duplicate. */
const idFor = (email: string) => createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 40);

const iso = (v: unknown) => (v instanceof Timestamp ? v.toDate().toISOString() : new Date(0).toISOString());

/** Adds (or re-activates) a subscriber. Returns whether the address was new. */
export async function subscribe(
  email: string,
  meta: { source: string | null; userAgent: string | null; submittedFromPath: string | null },
): Promise<{ created: boolean }> {
  const ref = adminFirestore.collection(COLLECTION).doc(idFor(email));
  return adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      tx.update(ref, { status: "active", lastSignupAt: FieldValue.serverTimestamp() });
      return { created: false };
    }
    tx.set(ref, {
      email: email.toLowerCase(),
      source: meta.source,
      status: "active",
      createdAt: FieldValue.serverTimestamp(),
      lastSignupAt: FieldValue.serverTimestamp(),
      userAgent: meta.userAgent,
      submittedFromPath: meta.submittedFromPath,
    });
    return { created: true };
  });
}

export async function listSubscribers(): Promise<Subscriber[]> {
  const snap = await adminFirestore.collection(COLLECTION).orderBy("createdAt", "desc").get();
  return snap.docs.map((d) => {
    const x = d.data();
    return {
      id: d.id,
      email: x.email,
      source: x.source ?? null,
      status: x.status === "unsubscribed" ? "unsubscribed" : "active",
      createdAt: iso(x.createdAt),
      lastSignupAt: iso(x.lastSignupAt),
    };
  });
}
