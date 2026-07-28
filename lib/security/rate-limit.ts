import "server-only";
import crypto from "node:crypto";
import { adminFirestore } from "@/lib/firebase/admin";

// App Hosting can run multiple instances (see apphosting.yaml maxInstances),
// so an in-memory per-process counter would be trivially bypassed by load
// balancing across instances. This Firestore-backed limiter is transactional
// and shared across all instances. Firestore's TTL policy (configured on the
// `expiresAt` field via the Firebase console/gcloud, not in code) cleans up
// old bucket documents automatically.
const COLLECTION = "admin_rate_limits";

function hashKey(key: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "";
  return crypto.createHash("sha256").update(`${salt}:${key}`).digest("hex").slice(0, 40);
}

function bucketId(key: string, windowSeconds: number): string {
  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  return `${hashKey(key)}_${bucket}`;
}

/**
 * Returns true if the caller is within the allowed rate, false if they
 * should be rejected (e.g. respond 429). `key` should already identify the
 * caller (e.g. a hashed IP, or `ip:route`) — never pass a raw, unhashed IP,
 * to avoid storing it long-term in Firestore.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  const ref = adminFirestore.collection(COLLECTION).doc(bucketId(key, windowSeconds));
  const expiresAt = new Date(Date.now() + windowSeconds * 1000 * 2);

  return adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const count = snap.exists ? ((snap.data()?.count as number | undefined) ?? 0) : 0;
    if (count >= limit) return false;
    tx.set(ref, { count: count + 1, expiresAt }, { merge: true });
    return true;
  });
}

/** Best-effort client IP extraction behind Firebase App Hosting's proxy. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return "unknown";
}
