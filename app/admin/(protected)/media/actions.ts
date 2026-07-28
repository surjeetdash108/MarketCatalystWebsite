"use server";

import { revalidatePath } from "next/cache";
import { requireEditorOrAdmin } from "@/lib/auth/rbac";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { uploadMedia, deleteMedia, listMedia, type MediaItem } from "@/lib/media/library";
import { InvalidImageError } from "@/lib/security/validate-image";

export type UploadState = { error?: string; item?: MediaItem } | null;

export async function uploadMediaAction(_prev: UploadState, formData: FormData): Promise<UploadState> {
  const user = await requireEditorOrAdmin();

  // Cost/abuse guard on Cloud Storage writes — separate from the public
  // contact-form limiter, keyed per authenticated uid rather than IP since
  // this endpoint is auth-gated.
  const withinRate = await checkRateLimit(`media-upload:${user.uid}`, 30, 3600);
  if (!withinRate) {
    return { error: "Upload rate limit reached — try again in a bit." };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "No file provided." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const item = await uploadMedia(buffer, file.name, user.uid);
    revalidatePath("/admin/media");
    return { item };
  } catch (err) {
    if (err instanceof InvalidImageError) {
      return { error: err.message };
    }
    throw err;
  }
}

export async function deleteMediaAction(id: string): Promise<void> {
  await requireEditorOrAdmin();
  await deleteMedia(id);
  revalidatePath("/admin/media");
}

export async function listMediaAction(): Promise<MediaItem[]> {
  await requireEditorOrAdmin();
  return listMedia();
}
