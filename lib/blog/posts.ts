import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { ensureUniqueSlug, releaseSlug } from "./slug";
import type { CreatePostInput, UpdatePostInput } from "@/lib/validation/blog";

export type PostStatus = "draft" | "published";

export type PostSeo = {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  canonicalUrl: string | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: PostStatus;
  authorId: string;
  editorId: string | null;
  categories: string[];
  tags: string[];
  coverImageUrl: string | null;
  seo: PostSeo;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const POSTS = "posts";

function toIso(value: Timestamp | undefined | null): string | null {
  return value ? value.toDate().toISOString() : null;
}

function mapPost(id: string, data: FirebaseFirestore.DocumentData): Post {
  return {
    id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    status: data.status,
    authorId: data.authorId,
    editorId: data.editorId ?? null,
    categories: data.categories ?? [],
    tags: data.tags ?? [],
    coverImageUrl: data.coverImageUrl ?? null,
    seo: {
      metaTitle: data.seo?.metaTitle ?? null,
      metaDescription: data.seo?.metaDescription ?? null,
      ogImageUrl: data.seo?.ogImageUrl ?? null,
      canonicalUrl: data.seo?.canonicalUrl ?? null,
    },
    publishedAt: toIso(data.publishedAt),
    createdAt: toIso(data.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toIso(data.updatedAt) ?? new Date(0).toISOString(),
  };
}

/** Public site only ever calls this — never fetches unfiltered posts. */
export async function getPublishedPosts(): Promise<Post[]> {
  const snap = await adminFirestore
    .collection(POSTS)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .get();
  return snap.docs.map((doc) => mapPost(doc.id, doc.data()));
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  const snap = await adminFirestore
    .collection(POSTS)
    .where("slug", "==", slug)
    .where("status", "==", "published")
    .limit(1)
    .get();
  if (snap.empty) return null;
  return mapPost(snap.docs[0]!.id, snap.docs[0]!.data());
}

/** Admin panel only — queries every post regardless of status. */
export async function getAllPostsForAdmin(): Promise<Post[]> {
  const snap = await adminFirestore.collection(POSTS).orderBy("updatedAt", "desc").get();
  return snap.docs.map((doc) => mapPost(doc.id, doc.data()));
}

export async function getPostById(id: string): Promise<Post | null> {
  const doc = await adminFirestore.collection(POSTS).doc(id).get();
  if (!doc.exists) return null;
  return mapPost(doc.id, doc.data()!);
}

export async function createPost(input: CreatePostInput, authorId: string): Promise<Post> {
  const ref = adminFirestore.collection(POSTS).doc();
  await ensureUniqueSlug(input.slug, ref.id);

  const now = FieldValue.serverTimestamp();
  await ref.set({
    title: input.title,
    slug: input.slug,
    excerpt: input.excerpt ?? "",
    content: input.content,
    status: "draft",
    authorId,
    editorId: authorId,
    categories: input.categories ?? [],
    tags: input.tags ?? [],
    coverImageUrl: input.coverImageUrl || null,
    seo: {
      metaTitle: input.seo?.metaTitle || null,
      metaDescription: input.seo?.metaDescription || null,
      ogImageUrl: input.seo?.ogImageUrl || null,
      canonicalUrl: input.seo?.canonicalUrl || null,
    },
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  const created = await getPostById(ref.id);
  return created!;
}

export async function updatePost(input: UpdatePostInput, editorId: string): Promise<void> {
  const ref = adminFirestore.collection(POSTS).doc(input.id);
  const existing = await getPostById(input.id);
  if (!existing) throw new Error("post_not_found");

  if (input.slug && input.slug !== existing.slug) {
    await ensureUniqueSlug(input.slug, input.id);
    await releaseSlug(existing.slug);
  }

  await ref.update({
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.slug !== undefined ? { slug: input.slug } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
    ...(input.content !== undefined ? { content: input.content } : {}),
    ...(input.categories !== undefined ? { categories: input.categories } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.coverImageUrl !== undefined ? { coverImageUrl: input.coverImageUrl || null } : {}),
    ...(input.seo !== undefined
      ? {
          seo: {
            metaTitle: input.seo.metaTitle || null,
            metaDescription: input.seo.metaDescription || null,
            ogImageUrl: input.seo.ogImageUrl || null,
            canonicalUrl: input.seo.canonicalUrl || null,
          },
        }
      : {}),
    editorId,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function setPostStatus(id: string, status: PostStatus, editorId: string): Promise<void> {
  const ref = adminFirestore.collection(POSTS).doc(id);
  const existing = await getPostById(id);
  if (!existing) throw new Error("post_not_found");

  const update: Record<string, unknown> = {
    status,
    editorId,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // publishedAt is set once, on first publish, and never moved afterward —
  // subsequent edits to an already-published post only bump updatedAt.
  if (status === "published" && !existing.publishedAt) {
    update.publishedAt = FieldValue.serverTimestamp();
  }

  await ref.update(update);
}

export async function deletePost(id: string): Promise<void> {
  const existing = await getPostById(id);
  if (!existing) return;
  await releaseSlug(existing.slug);
  await adminFirestore.collection(POSTS).doc(id).delete();
}
