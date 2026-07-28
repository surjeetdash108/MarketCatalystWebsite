"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireEditorOrAdmin } from "@/lib/auth/rbac";
import { createPostSchema, updatePostSchema, publishPostSchema, deletePostSchema } from "@/lib/validation/blog";
import { createPost, updatePost, setPostStatus, deletePost } from "@/lib/blog/posts";
import { slugify } from "@/lib/blog/slug";

export type ActionState = { error?: string } | null;

function parseTags(value: FormDataEntryValue | null): string[] {
  if (typeof value !== "string" || !value.trim()) return [];
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export async function createPostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireEditorOrAdmin();

  const title = String(formData.get("title") ?? "");
  const slugRaw = String(formData.get("slug") ?? "");

  const parsed = createPostSchema.safeParse({
    title,
    slug: slugRaw.trim() ? slugRaw : slugify(title),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    categories: parseTags(formData.get("categories")),
    tags: parseTags(formData.get("tags")),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    seo: {
      metaTitle: String(formData.get("metaTitle") ?? ""),
      metaDescription: String(formData.get("metaDescription") ?? ""),
      ogImageUrl: String(formData.get("ogImageUrl") ?? ""),
      canonicalUrl: String(formData.get("canonicalUrl") ?? ""),
    },
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_input" };
  }

  let post;
  try {
    post = await createPost(parsed.data, user.uid);
  } catch (err) {
    if (err instanceof Error && err.message === "slug_taken") {
      return { error: "That slug is already in use." };
    }
    throw err;
  }

  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${post.id}/edit`);
}

export async function updatePostAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireEditorOrAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = updatePostSchema.safeParse({
    id,
    title: String(formData.get("title") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    content: String(formData.get("content") ?? ""),
    categories: parseTags(formData.get("categories")),
    tags: parseTags(formData.get("tags")),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    seo: {
      metaTitle: String(formData.get("metaTitle") ?? ""),
      metaDescription: String(formData.get("metaDescription") ?? ""),
      ogImageUrl: String(formData.get("ogImageUrl") ?? ""),
      canonicalUrl: String(formData.get("canonicalUrl") ?? ""),
    },
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "invalid_input" };
  }

  try {
    await updatePost(parsed.data, user.uid);
  } catch (err) {
    if (err instanceof Error && err.message === "slug_taken") {
      return { error: "That slug is already in use." };
    }
    throw err;
  }

  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}/edit`);
  return { error: undefined };
}

export async function setPostStatusAction(id: string, status: "draft" | "published"): Promise<void> {
  const user = await requireEditorOrAdmin();
  const parsed = publishPostSchema.safeParse({ id, status });
  if (!parsed.success) throw new Error("invalid_input");

  await setPostStatus(parsed.data.id, parsed.data.status, user.uid);
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}/edit`);
  revalidatePath("/blog");
}

export async function deletePostAction(id: string): Promise<void> {
  await requireEditorOrAdmin();
  const parsed = deletePostSchema.safeParse({ id });
  if (!parsed.success) throw new Error("invalid_input");

  await deletePost(parsed.data.id);
  revalidatePath("/admin/posts");
  revalidatePath("/blog");
}
