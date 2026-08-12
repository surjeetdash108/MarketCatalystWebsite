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
    type: String(formData.get("type") || "featured"),
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
    type: String(formData.get("type") || "featured"),
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
  revalidatePath("/posts");
}

export async function deletePostAction(id: string): Promise<void> {
  await requireEditorOrAdmin();
  const parsed = deletePostSchema.safeParse({ id });
  if (!parsed.success) throw new Error("invalid_input");

  await deletePost(parsed.data.id);
  revalidatePath("/admin/posts");
  revalidatePath("/posts");
}

// ---------------------------------------------------------------------------
// Document import (.docx / .pdf) -> editor content
//
// The Tiptap editor stores canonical Markdown (see components/admin/TiptapEditor
// and lib/blog/render-markdown.ts), and its markdown-it parser runs with
// `html: false`, which escapes any raw HTML into literal text. So we convert
// the parsed document into Markdown here (server-side only — the site CSP
// blocks browser CDN libs, and these parsers are heavy Node-only packages).
// ---------------------------------------------------------------------------

export type ParseDocumentResult = { content: string; title?: string } | { error: string };

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;|&rsquo;|&lsquo;/gi, "'")
    .replace(/&ldquo;|&rdquo;/gi, '"')
    .replace(/&mdash;/gi, "—")
    .replace(/&ndash;/gi, "–")
    .replace(/&amp;/gi, "&");
}

/** Convert an inline HTML fragment to Markdown, stripping any tags we don't map. */
function inlineToMarkdown(html: string): string {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "  \n")
      .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, c) => `**${c.trim()}**`)
      .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, (_m, _t, c) => `*${c.trim()}*`)
      .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_m, c) => `\`${c.trim()}\``)
      .replace(/<a[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi, (_m, href, c) => `[${c.trim()}](${href})`)
      .replace(/<[^>]+>/g, ""),
  )
    .replace(/[ \t]+/g, " ")
    .trim();
}

function listToMarkdown(inner: string, ordered: boolean): string {
  let n = 0;
  const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => {
    n += 1;
    const marker = ordered ? `${n}.` : "-";
    return `${marker} ${inlineToMarkdown(m[1]!).replace(/\s*\n\s*/g, " ").trim()}`;
  });
  return items.join("\n");
}

/** Best-effort HTML -> Markdown for imported documents (headings, lists, emphasis, links). */
function htmlToMarkdown(html: string): string {
  let s = html.replace(/\r/g, "");
  for (let level = 1; level <= 6; level += 1) {
    const hashes = "#".repeat(level);
    s = s.replace(new RegExp(`<h${level}[^>]*>([\\s\\S]*?)</h${level}>`, "gi"), (_m, c) => `\n\n${hashes} ${inlineToMarkdown(c)}\n\n`);
  }
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, c) => `\n\n> ${inlineToMarkdown(c).replace(/\s*\n\s*/g, " ")}\n\n`);
  s = s.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_m, c) => `\n\n${listToMarkdown(c, false)}\n\n`);
  s = s.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_m, c) => `\n\n${listToMarkdown(c, true)}\n\n`);
  s = s.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, c) => `\n\n${inlineToMarkdown(c)}\n\n`);
  s = s.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");
  s = inlineToMarkdown(s);
  return s.replace(/\n{3,}/g, "\n\n").trim();
}

/** Extract a title from the first top-level heading of the imported HTML. */
function firstHeading(html: string): string | undefined {
  const m = html.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  const title = m ? inlineToMarkdown(m[1]!) : "";
  return title || undefined;
}

function escapeHtml(input: string): string {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Parse an uploaded .docx (via mammoth) or .pdf (via pdf-parse) into editor
 * content. Returns { content, title? } on success or { error } on failure.
 * Not wired through useActionState — called directly from the editor with a
 * FormData carrying the chosen file.
 */
export async function parseDocumentAction(formData: FormData): Promise<ParseDocumentResult> {
  await requireEditorOrAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "No document was provided." };
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (name.endsWith(".docx")) {
      const mammoth = (await import("mammoth")).default;
      const { value: html } = await mammoth.convertToHtml({ buffer });
      const content = htmlToMarkdown(html);
      if (!content) return { error: "The document appears to be empty." };
      const title = firstHeading(html);
      return title ? { content, title } : { content };
    }

    if (name.endsWith(".pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      try {
        const result = await parser.getText();
        const paragraphs = result.text
          .split(/\n\s*\n/)
          .map((block) => block.replace(/\s*\n\s*/g, " ").trim())
          .filter(Boolean);
        if (paragraphs.length === 0) return { error: "No extractable text was found in the PDF." };
        const html = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
        return { content: htmlToMarkdown(html) };
      } finally {
        await parser.destroy();
      }
    }

    return { error: "Unsupported file type. Upload a .docx or .pdf." };
  } catch (err) {
    return { error: err instanceof Error ? `Could not parse document: ${err.message}` : "Could not parse document." };
  }
}
