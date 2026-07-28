import "server-only";
import crypto from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore, adminStorage } from "@/lib/firebase/admin";
import { validateImageBuffer } from "@/lib/security/validate-image";

const COLLECTION = "media";

export type MediaItem = {
  id: string;
  url: string;
  storagePath: string;
  contentType: string;
  size: number;
  originalFilename: string;
  uploadedBy: string;
  createdAt: string;
};

function mapMedia(id: string, data: FirebaseFirestore.DocumentData): MediaItem {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    url: data.url,
    storagePath: data.storagePath,
    contentType: data.contentType,
    size: data.size,
    originalFilename: data.originalFilename,
    uploadedBy: data.uploadedBy,
    createdAt: createdAt ? createdAt.toDate().toISOString() : new Date(0).toISOString(),
  };
}

function safeBaseName(filename: string): string {
  const base = filename.split(/[/\\]/).pop() ?? "upload";
  return base.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100) || "upload";
}

/**
 * Validates the buffer's actual file signature (see validate-image.ts),
 * uploads it to Cloud Storage under a per-uploader path, makes the object
 * public (blog hero images are inherently public content — the same trust
 * boundary as the post itself), and records metadata in Firestore for the
 * media library grid. Caller is responsible for RBAC (requireEditorOrAdmin)
 * before calling this — mirrors every other lib/blog & lib/contact function.
 */
export async function uploadMedia(buffer: Buffer, originalFilename: string, uploaderUid: string): Promise<MediaItem> {
  const { contentType, extension } = validateImageBuffer(buffer);

  const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}-${safeBaseName(originalFilename)}`;
  const storagePath = `blog-media/${uploaderUid}/${uniqueName}.${extension}`;

  const file = adminStorage.file(storagePath);
  await file.save(buffer, { contentType, resumable: false });
  await file.makePublic();

  const url = `https://storage.googleapis.com/${adminStorage.name}/${storagePath}`;

  const ref = adminFirestore.collection(COLLECTION).doc();
  await ref.set({
    url,
    storagePath,
    contentType,
    size: buffer.byteLength,
    originalFilename: safeBaseName(originalFilename),
    uploadedBy: uploaderUid,
    createdAt: FieldValue.serverTimestamp(),
  });

  return mapMedia(ref.id, (await ref.get()).data()!);
}

export async function listMedia(): Promise<MediaItem[]> {
  const snap = await adminFirestore.collection(COLLECTION).orderBy("createdAt", "desc").limit(200).get();
  return snap.docs.map((doc) => mapMedia(doc.id, doc.data()));
}

export async function deleteMedia(id: string): Promise<void> {
  const doc = await adminFirestore.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return;

  const { storagePath } = doc.data()!;
  await adminStorage
    .file(storagePath)
    .delete()
    .catch(() => undefined); // already gone from Storage is fine — still clean up the Firestore doc
  await doc.ref.delete();
}
