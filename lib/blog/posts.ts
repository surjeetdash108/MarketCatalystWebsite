import "server-only";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { ensureUniqueSlug, releaseSlug } from "./slug";
import { DUPLICATE_POSTS } from "@/lib/seo/duplicate-posts";
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
export type BlogType = "educational" | "recap" | "research" | "news" | "earnings";

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
   *  service. Scoped to the article before they are applied.
   *
   *  THIS post's design, not the site's: the shared theme is one document that
   *  every upload overwrites, so resolving a post's look from it meant a
   *  published article was restyled by the next article. See resolvePostDesign. */
  css: string[];
  /** The html post's document as uploaded, <head> included. Kept so a post can
   *  be reproduced exactly — and so a post stored before `css` existed can have
   *  its stylesheet recovered from it rather than re-uploaded. */
  documentHtml: string | null;
  /** Featured by the admin console as Editor's choice. A flag on the post
   *  itself (set by the backend's BlogsAdminService), not a separate pointer. */
  editorsChoice: boolean;
  seo: PostSeo;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const POSTS = "posts";

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  return null;
}

/**
 * Legacy fallback: posts written before the explicit `type` field only have
 * free-text `categories`. Derive a type from them so old docs still land in a
 * sensible section. Anything unrecognized defaults to "educational".
 */
function deriveTypeFromCategories(categories: unknown): BlogType {
  const cats = Array.isArray(categories) ? categories.map((c) => String(c).toLowerCase()) : [];
  const has = (kw: string) => cats.some((c) => c.includes(kw));
  if (has("news")) return "news";
  if (has("earnings")) return "earnings";
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
    coverImageUrl: typeof data.coverImageUrl === "string" && data.coverImageUrl.trim() ? data.coverImageUrl.trim() : null,
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
      ? (data.css as unknown[]).filter(
          (c): c is string => typeof c === "string" && !!c.trim(),
        )
      : [],
    documentHtml: typeof data.documentHtml === "string" && data.documentHtml
      ? data.documentHtml
      : null,
    // Posts written before Word support carry no kind and were all PDFs.
    sourceKind:
      data.sourceKind === "docx" || data.sourceKind === "pdf"
        ? data.sourceKind
        : typeof data.pdfUrl === "string"
          ? "pdf"
          : null,
    editorsChoice: data.editorsChoice === true,
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

/**
 * A post without its heavy fields. `documentHtml` (the whole uploaded page,
 * <head> included) and `css` are what made /posts ship 11 MB: they rode along
 * to the browser inside every card. Listings, feeds and sitemaps need none of
 * them.
 */
export type PostSummary = Omit<Post, "content" | "css" | "documentHtml">;

/** `PostSummary` plus the body, for callers that derive something from it (reading time, a card blurb) server-side. */
export type PostListing = PostSummary & { content: string };

/** Every field a summary needs. Firestore `select()` leaves the rest on the server. */
const SUMMARY_FIELDS = [
  "title", "slug", "excerpt", "status", "type", "rank", "authorId", "author", "editorId",
  "categories", "tags", "coverImageUrl", "pdfUrl", "pdfName", "pdfPages", "pdfAspect",
  "sourceKind", "format", "editorsChoice", "seo", "publishedAt", "createdAt", "updatedAt",
];

/** A copy of the post without the named fields (the heavy ones). */
function omit<K extends keyof Post>(post: Post, keys: K[]): Omit<Post, K> {
  const copy: Partial<Post> = { ...post };
  for (const key of keys) delete copy[key];
  return copy as Omit<Post, K>;
}

function newestFirst<T extends { publishedAt: string | null; createdAt: string }>(posts: T[]): T[] {
  return posts.sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));
}

/**
 * Published posts for the /posts board: summary fields plus `content`, but never
 * `documentHtml` or `css`. Same visibility and sort rules as getPublishedPosts.
 */
export async function getPublishedPostListings(): Promise<PostListing[]> {
  const snap = await adminFirestore
    .collection(POSTS)
    .where("status", "==", "published")
    .select(...SUMMARY_FIELDS, "content")
    .get();
  const posts = snap.docs.map((doc) => omit(mapPost(doc.id, doc.data()), ["css", "documentHtml"]));
  return newestFirst(posts);
}

/** Published posts as light summaries: no body, no stylesheet, no uploaded document. */
export async function getPublishedPostSummaries(): Promise<PostSummary[]> {
  const snap = await adminFirestore
    .collection(POSTS)
    .where("status", "==", "published")
    .select(...SUMMARY_FIELDS)
    .get();
  const posts = snap.docs.map((doc) => omit(mapPost(doc.id, doc.data()), ["content", "css", "documentHtml"]));
  return newestFirst(posts);
}

/* Shared by the sitemap, the feeds, the related-posts block and the 404 page.
   Every request would otherwise read every published post, a list that grows by
   5-6 a day. Held in memory for five minutes instead: new posts appear within
   that, and crawlers re-read these on a scale of hours anyway. Failures are not
   cached, so the next request simply tries again. */
const SUMMARIES_TTL_MS = 5 * 60 * 1000;
let cachedSummaries: { at: number; posts: PostSummary[] } | null = null;
/** Concurrent requests share one Firestore read rather than each starting one. */
let summariesInFlight: Promise<PostSummary[]> | null = null;

export async function getCachedPostSummaries(): Promise<PostSummary[]> {
  if (cachedSummaries && Date.now() - cachedSummaries.at < SUMMARIES_TTL_MS) return cachedSummaries.posts;
  summariesInFlight ??= getPublishedPostSummaries()
    .then((posts) => {
      cachedSummaries = { at: Date.now(), posts };
      return posts;
    })
    .finally(() => {
      summariesInFlight = null;
    });
  return summariesInFlight;
}

const duplicateSlugs = new Set(DUPLICATE_POSTS.map(([copy]) => copy));

/**
 * The cached summaries minus duplicate copies. A copy 301s to its original, so
 * anything that links to or lists posts (sitemap, feeds, related-post links, the
 * 404 page) must leave it out or it would point crawlers at a redirect.
 */
export async function getLivePostSummaries(): Promise<PostSummary[]> {
  return (await getCachedPostSummaries()).filter((p) => !duplicateSlugs.has(p.slug));
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
