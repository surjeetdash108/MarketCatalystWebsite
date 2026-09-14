/**
 * One-shot migration: strip the SITE's own furniture out of already-published
 * html posts.
 *
 * These articles were uploaded as complete standalone pages, so their body
 * carries a masthead and a `← Back to blogs` link of their own. The site draws
 * both, so a reader got two of each — and the document's back link is
 * `href="#"`, a dead control. The leftover <title>/<body> scaffolding published
 * as loose text for the same reason, and all of it leaked into the blog board's
 * card blurb, which derives its text by stripping tags off the body.
 *
 * The upload path now does this on write (stripSiteChrome in the backend's
 * blogs-admin.service.ts); this is the same rule applied to what is already
 * stored. Idempotent — a second run reports 0 changes.
 *
 * Usage (--env-file loads .env; FIRESTORE_DATABASE_ID there is the default):
 *   npm run blogs:strip-chrome            # dry run
 *   npm run blogs:strip-chrome -- --apply # write
 *
 * Without --apply it is a DRY RUN: it prints what each post would lose and
 * writes nothing.
 */
import { getApps, getApp, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const arg = (n: string) => process.argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const APPLY = process.argv.includes("--apply");

/** Kept in step with stripSiteChrome() in MarketCatalystBackend. */
function stripSiteChrome(html: string): string {
  let out = html;
  // Document scaffolding that survived the original import: a <title> whose
  // text publishes as a loose line, and stray html/head/body tags.
  out = out.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "");
  out = out.replace(/<\/?(?:html|head|body)\b[^>]*>/gi, "");
  // The back link, by what it SAYS rather than by its class.
  out = out.replace(
    /<a\b[^>]*>(?:(?!<\/a>)[\s\S])*?back\s*to\s*blogs?(?:(?!<\/a>)[\s\S])*?<\/a>/gi,
    "",
  );
  // A LEADING site masthead only — a <header> inside the article is left alone.
  out = out.replace(
    /^(\s*(?:<!--[\s\S]*?-->\s*)*)<header\b[^>]*>([\s\S]*?)<\/header>/i,
    (match, lead: string, inner: string) =>
      /<nav\b|class\s*=\s*["'][^"']*\blogo\b/i.test(inner) ? lead : match,
  );
  return out.trim();
}

async function main() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("FIREBASE_PROJECT_ID is not set");
  if (!getApps().length) {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, "\n");
    initializeApp({
      credential:
        clientEmail && privateKey
          ? cert({ projectId, clientEmail, privateKey })
          : applicationDefault(),
      projectId,
    });
  }
  const dbId = arg("database") || process.env.FIRESTORE_DATABASE_ID;
  const db = dbId ? getFirestore(getApp(), dbId) : getFirestore();
  console.log(`project=${projectId} database=${dbId || "(default)"} mode=${APPLY ? "APPLY" : "DRY RUN"}`);

  const snap = await db.collection("blogs").get();
  let changed = 0;
  for (const doc of snap.docs) {
    const data = doc.data();
    const update: Record<string, string> = {};
    for (const field of ["content", "documentHtml"] as const) {
      const before = data[field];
      if (typeof before !== "string" || !before) continue;
      // documentHtml is kept whole ON PURPOSE — it is what reproduces the post
      // as uploaded. Only the published body is cleaned.
      if (field === "documentHtml") continue;
      const after = stripSiteChrome(before);
      if (after !== before) update[field] = after;
    }
    if (!Object.keys(update).length) continue;
    changed += 1;
    const removed = update.content !== undefined ? data.content.length - update.content.length : 0;
    console.log(`\n${doc.id}  ${data.slug}`);
    console.log(`  content: ${data.content.length} → ${update.content.length} chars (−${removed})`);
    console.log(`  now starts: ${JSON.stringify(update.content.slice(0, 120))}`);
    if (APPLY) {
      // Not `updatedAt`: this repairs how the post was stored, it is not an
      // edit anyone made, and bumping the stamp would reorder the admin list.
      await doc.ref.update(update);
    }
  }
  console.log(`\n${changed} post(s) ${APPLY ? "updated" : "would change"} of ${snap.size}.`);
  if (!APPLY && changed) console.log("Re-run with --apply to write.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
