import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { ensureUniqueSlug, releaseSlug } from "./slug";
import type { CreatePostInput, UpdatePostInput } from "@/lib/validation/blog";

export type PostStatus = "draft" | "published";

/** Source-document kinds the post page can draw. */
export type SourceKind = "pdf" | "docx";

/** How a post's body is authored — see BlogFormat in the backend admin service.
 *  Distinct from `type`, which is the board zone. */
export type BlogFormat = "html" | "text" | "pdf" | "doc";

/**
 * The blog "type" is now the source of truth for which public zone a post
 * lands in (see components/blog/BlogBoard.tsx). `categories` is still stored
 * for backward-compat and for legacy docs that predate this field.
 */
export type BlogType = "educational" | "recap" | "research";

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
  type: BlogType;
  /** Display order within its type/zone on the public board — lower shows first.
   *  Unranked docs default to 999 so they sort after ranked ones. */
  rank: number;
  authorId: string;
  /** Display name written by the console ("Desk", a person's name). Distinct
   *  from authorId, which is the account that wrote the post. */
  author: string;
  editorId: string | null;
  categories: string[];
  tags: string[];
  coverImageUrl: string | null;
  /** Storage URL of the source document when the post was published from one.
   *  The research desk designs in PDF or Word; its tables, KPI cards and
   *  images exist only there, so the original IS the article. The `pdf*` names
   *  predate Word support — `sourceKind` says which kind this actually is. */
  pdfUrl: string | null;
  pdfName: string | null;
  /** PDF only — Word has no page count until a renderer paginates it. */
  pdfPages: number | null;
  pdfAspect: number | null;
  sourceKind: SourceKind | null;
  /** Decides how the body renders: a drawn document, authored markup with its
   *  own CSS, or prose. */
  format: BlogFormat;
  /** Stylesheets for an html post, already split out of the body by the admin
   *  service. Scoped to the article before they are applied. */
  css: string[];
  seo: PostSeo;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const POSTS = "blogs";

function toIso(value: Timestamp | undefined | null): string | null {
  return value ? value.toDate().toISOString() : null;
}

/**
 * Legacy fallback: posts written before the explicit `type` field only have
 * free-text `categories`. Derive a type from them so old docs still land in a
 * sensible section. Anything unrecognized defaults to "educational".
 */
function deriveTypeFromCategories(categories: unknown): BlogType {
  const cats = Array.isArray(categories) ? categories.map((c) => String(c).toLowerCase()) : [];
  const has = (kw: string) => cats.some((c) => c.includes(kw));
  if (has("recap")) return "recap";
  if (has("research")) return "research";
  return "educational";
}

function mapPost(id: string, data: FirebaseFirestore.DocumentData): Post {
  return {
    id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt ?? "",
    content: data.content ?? "",
    status: data.status,
    type: (data.type as BlogType) ?? deriveTypeFromCategories(data.categories),
    rank: typeof data.rank === "number" ? data.rank : 999,
    authorId: data.authorId,
    author: typeof data.author === "string" ? data.author : "",
    editorId: data.editorId ?? null,
    categories: data.categories ?? [],
    tags: data.tags ?? [],
    coverImageUrl: data.coverImageUrl ?? null,
    pdfUrl: typeof data.pdfUrl === "string" ? data.pdfUrl : null,
    pdfName: typeof data.pdfName === "string" ? data.pdfName : null,
    pdfPages: typeof data.pdfPages === "number" ? data.pdfPages : null,
    pdfAspect: typeof data.pdfAspect === "number" ? data.pdfAspect : null,
    // Posts written before formats existed carry none: a stored source document
    // says what they are, anything else is the prose `content` has always held.
    format:
      data.format === "html" || data.format === "text" ||
      data.format === "pdf" || data.format === "doc"
        ? data.format
        : typeof data.pdfUrl === "string"
          ? data.sourceKind === "docx" ? "doc" : "pdf"
          : "text",
    css: Array.isArray(data.css)
      ? (data.css as unknown[]).filter((c): c is string => typeof c === "string")
      : [],
    // Posts written before Word support carry no kind and were all PDFs.
    sourceKind:
      data.sourceKind === "docx" || data.sourceKind === "pdf"
        ? data.sourceKind
        : typeof data.pdfUrl === "string"
          ? "pdf"
          : null,
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
  // NOTE: do NOT add `.orderBy("publishedAt")` here. Firestore's orderBy
  // silently EXCLUDES any document missing that field, so a published post
  // whose publishedAt was never set would vanish from the public list. We
  // fetch every published post and sort in memory (the list is small), so a
  // post is visible the moment its status is "published", with or without a
  // publishedAt timestamp. Sort key falls back to createdAt.
  const snap = await adminFirestore
    .collection(POSTS)
    .where("status", "==", "published")
    .get();
  const posts = snap.docs.map((doc) => mapPost(doc.id, doc.data()));
  posts.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
  return posts;
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
    type: input.type,
    rank: input.rank ?? 999,
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
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.rank !== undefined ? { rank: input.rank } : {}),
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
