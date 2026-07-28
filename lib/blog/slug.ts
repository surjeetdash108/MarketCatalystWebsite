import "server-only";
import { adminFirestore } from "@/lib/firebase/admin";

export { slugify } from "./slugify";

/**
 * Firestore has no native unique-field constraint, so slug uniqueness is
 * enforced via a `slugs/{slug}` index collection, checked/claimed inside a
 * transaction. Throws if the slug is already taken by a different post.
 */
export async function ensureUniqueSlug(slug: string, postId: string): Promise<void> {
  const slugRef = adminFirestore.collection("slugs").doc(slug);

  await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(slugRef);
    if (snap.exists && snap.data()?.postId !== postId) {
      throw new Error("slug_taken");
    }
    tx.set(slugRef, { postId });
  });
}

export async function releaseSlug(slug: string): Promise<void> {
  await adminFirestore.collection("slugs").doc(slug).delete();
}
