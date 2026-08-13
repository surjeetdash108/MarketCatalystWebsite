/**
 * Non-destructive CRUD smoke test for the `blogs` collection — exercises the
 * exact Firebase Admin SDK operations the admin server actions use
 * (create/read/update/publish/delete), on a throwaway doc id `zzz-crud-test-tmp`,
 * then deletes it. Does NOT touch any real blog docs.
 *
 * Usage: npx tsx scripts/crud-test-blogs.ts --project=market-catalyst-502415
 */
import { getApps, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const ID = "zzz-crud-test-tmp";

async function main() {
  const projectId = arg("project") || process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Set --project=<id>");
  if (!getApps().length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    initializeApp({
      credential: clientEmail && privateKey ? cert({ projectId, clientEmail, privateKey }) : applicationDefault(),
      projectId,
    });
  }
  const db = getFirestore();
  const ref = db.collection("blogs").doc(ID);
  const ok = (s: string) => console.log(`  ✓ ${s}`);

  // CREATE
  await ref.set({
    title: "CRUD test", slug: "zzz-crud-test-tmp", excerpt: "", content: "test",
    status: "draft", type: "featured", authorId: "crud-test", editorId: "crud-test",
    categories: [], tags: [], coverImageUrl: null,
    seo: { metaTitle: null, metaDescription: null, ogImageUrl: null, canonicalUrl: null },
    publishedAt: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
  });
  ok("CREATE — wrote blogs/zzz-crud-test-tmp (status=draft)");

  // READ
  let snap = await ref.get();
  if (!snap.exists) throw new Error("READ failed — doc not found after create");
  ok(`READ — found it (title="${snap.data()!.title}", type=${snap.data()!.type})`);

  // UPDATE
  await ref.update({ title: "CRUD test (edited)", type: "stock", updatedAt: FieldValue.serverTimestamp() });
  snap = await ref.get();
  if (snap.data()!.title !== "CRUD test (edited)" || snap.data()!.type !== "stock") throw new Error("UPDATE failed");
  ok('UPDATE — title/type changed (now type=stock)');

  // PUBLISH (setPostStatus path)
  await ref.update({ status: "published", publishedAt: FieldValue.serverTimestamp() });
  snap = await ref.get();
  if (snap.data()!.status !== "published") throw new Error("PUBLISH failed");
  ok("PUBLISH — status=published, publishedAt set");

  // DELETE
  await ref.delete();
  snap = await ref.get();
  if (snap.exists) throw new Error("DELETE failed — doc still exists");
  ok("DELETE — doc removed; collection untouched otherwise");

  console.log("\nAll 5 operations succeeded — admin CRUD against `blogs` is fully working.");
}

main().catch((e) => { console.error("CRUD TEST FAILED:", e.message || e); process.exit(1); });
