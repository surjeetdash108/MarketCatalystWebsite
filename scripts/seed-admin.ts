/**
 * One-time local bootstrap for the very first super-admin account(s). Never
 * an HTTP endpoint — there is no route anywhere in this app that can grant
 * role: "ADMIN". Run locally with `gcloud auth application-default login`
 * already set up against an account with IAM access to the target project
 * (or FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY env vars for local-only
 * cert-based auth — never set those in apphosting.yaml).
 *
 * Usage:
 *   npm run seed:admin -- --email=you@example.com --project=market-catalyst-502415
 *
 * Both flags are required and have no default — a typo on --project must
 * not silently escalate a random account in the wrong (possibly prod, real
 * customer-holding) Firebase project.
 *
 * Authorization here is Firestore-only: this writes a website_members doc
 * with role: "ADMIN" and sets no custom claim. Firebase Auth is used purely
 * to authenticate the account (creating it if needed) — see
 * lib/auth/session.ts for why a claim would be ignored anyway.
 *
 * Deliberately self-contained (does not import lib/firebase/admin.ts or
 * lib/auth/members.ts) — those files import the `server-only` marker
 * package, which throws unconditionally unless resolved through Next.js's
 * bundler (which swaps in a no-op via the `react-server` export condition).
 * A plain script run through tsx/node never sets that condition, so
 * importing them here would always fail.
 */
import readline from "node:readline/promises";
import { getApps, getApp, initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

function parseArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(prefix));
  return found?.slice(prefix.length);
}

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(`${question} [y/N] `);
  rl.close();
  return answer.trim().toLowerCase() === "y";
}

function initAdminApp(projectId: string) {
  if (getApps().length) return getApp();

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), projectId });
  }
  return initializeApp({ credential: applicationDefault(), projectId });
}

async function main() {
  const email = parseArg("email") ?? process.env.SEED_ADMIN_EMAIL;
  const project = parseArg("project") ?? process.env.GOOGLE_CLOUD_PROJECT;

  if (!email) {
    console.error("Missing --email=<address> (or SEED_ADMIN_EMAIL env var). Refusing to guess.");
    process.exit(1);
  }
  if (!project) {
    console.error("Missing --project=<firebase-project-id> (or GOOGLE_CLOUD_PROJECT env var). Refusing to guess.");
    process.exit(1);
  }

  console.log(`About to grant role: "ADMIN" to ${email} in Firebase project ${project}.`);
  const ok = await confirm("This project may hold real customer data. Continue?");
  if (!ok) {
    console.log("Aborted.");
    process.exit(0);
  }

  const app = initAdminApp(project);
  const adminAuth = getAuth(app);
  const adminFirestore = getFirestore(app);

  let userRecord;
  try {
    userRecord = await adminAuth.getUserByEmail(email);
    console.log(`Found existing Auth user ${userRecord.uid} for ${email}.`);
  } catch {
    userRecord = await adminAuth.createUser({ email });
    console.log(`Created new Auth user ${userRecord.uid} for ${email}.`);
  }

  // Mirrors lib/auth/members.ts's upsertMemberDoc — duplicated here rather
  // than imported, for the server-only reason explained above. No custom
  // claim is set: website_members is the only thing that grants access.
  await adminFirestore
    .collection("website_members")
    .doc(userRecord.uid)
    .set(
      {
        email,
        displayName: userRecord.displayName ?? null,
        role: "ADMIN",
        invitedBy: null,
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

  console.log(`Done. ${email} now has role: "ADMIN" in website_members.`);
  if (userRecord.providerData.length === 0) {
    console.log(
      "This account has no sign-in provider yet (no password, no linked Google account) — " +
        "they'll need to sign in with Google (creates/links the account automatically) or " +
        "use 'Forgot password' from /admin/login once a password provider exists.",
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
