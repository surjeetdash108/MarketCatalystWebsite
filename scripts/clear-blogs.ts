/**
 * One-shot: delete EVERY document in the `blogs` Firestore collection, so fresh
 * content can be added from the admin UI. Prints the count removed. Auth mirrors
 * seed-blogs.ts (ADC or FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY).
 *
 * Usage:
 *   npm run clear:blogs -- --project=market-catalyst-502415
 */
import { getApps, getApp, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv.find((a) => a.startsWith(prefix))?.slice(prefix.length);
}

async function main() {
  const projectId =
    parseArg("project") || process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) throw new Error("Set --project=<id> or FIREBASE_PROJECT_ID");

  if (!getApps().length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    initializeApp({
      credential: clientEmail && privateKey ? cert({ projectId, clientEmail, privateKey }) : applicationDefault(),
      projectId,
    });
  }

  // Target the same Firestore database the app uses. Prod is `mc-regional`
  // (pass --database=mc-regional or set FIRESTORE_DATABASE_ID); unset = (default).
  const databaseId = parseArg("database") || process.env.FIRESTORE_DATABASE_ID;
  const db = databaseId ? getFirestore(getApp(), databaseId) : getFirestore();
  console.log(`Target database: ${databaseId || "(default)"}`);
  const snap = await db.collection("blogs").get();
  if (snap.empty) {
    console.log("blogs collection already empty — nothing to delete.");
    return;
  }
  // Batched deletes (Firestore caps a batch at 500 ops).
  let removed = 0;
  for (let i = 0; i < snap.docs.length; i += 450) {
    const batch = db.batch();
    for (const doc of snap.docs.slice(i, i + 450)) batch.delete(doc.ref);
    await batch.commit();
    removed += Math.min(450, snap.docs.length - i);
  }
  console.log(`Deleted ${removed} document(s) from 'blogs' (project ${projectId}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
