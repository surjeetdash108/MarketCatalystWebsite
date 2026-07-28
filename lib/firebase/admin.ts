import "server-only";
import { getApps, getApp, initializeApp, cert, applicationDefault, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Production (Firebase App Hosting) resolves credentials via Application
// Default Credentials against the backend's IAM-granted runtime service
// account — no service-account JSON or FIREBASE_PRIVATE_KEY env vars are
// declared in apphosting.yaml, so this path is exclusive there. Locally,
// where neither ADC (`gcloud auth application-default login`) nor the
// Firebase emulator suite may be set up, this also accepts an explicit
// service-account cert via FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY env
// vars — mirroring MarketCatalystBackEnd's firebase-admin.provider.ts
// fallback shape — for local dev/scripting only. Never set these in
// apphosting.yaml.
function createAdminApp(): App {
  if (getApps().length) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
      projectId,
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId,
  });
}

const adminApp = createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminFirestore = getFirestore(adminApp);

// NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is a public-safe value (just a bucket
// name, not a credential) already declared for the client SDK's config —
// reused here server-side since there's no need for a second, near-duplicate
// env var.
export const adminStorage = getStorage(adminApp).bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
