"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { TiptapEditor } from "./TiptapEditor";
import { MediaPicker } from "./MediaPicker";
import {
  createPostAction,
  updatePostAction,
  setPostStatusAction,
  parseDocumentAction,
  type ActionState,
} from "@/app/admin/(protected)/posts/actions";
import { slugify } from "@/lib/blog/slug-client";
import type { BlogType, Post } from "@/lib/blog/posts";

const BLOG_TYPES: { value: BlogType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "featured", label: "Featured" },
  { value: "educational", label: "Educational" },
  { value: "market", label: "Market" },
];

export function PostEditor({ post }: { post?: Post }) {
  const isEdit = Boolean(post);
  const action = isEdit ? updatePostAction : createPostAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [content, setContent] = useState(post?.content ?? "");
  // Bumping this key remounts TiptapEditor so it re-reads `content` — needed
  // when a document import replaces the content wholesale (the editor only
  // consumes `initialContent` on mount).
  const [editorKey, setEditorKey] = useState(0);
  const [type, setType] = useState<BlogType>(post?.type ?? "featured");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [isPending, startTransition] = useTransition();
  const [docPending, setDocPending] = useState(false);
  const [docError, setDocError] = useState<string | null>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleDocumentUpload(file: File) {
    setDocError(null);
    setDocPending(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await parseDocumentAction(formData);
      if ("error" in result) {
        setDocError(result.error);
        return;
      }
      setContent(result.content);
      setEditorKey((k) => k + 1);
      if (result.title && !title.trim()) {
        setTitle(result.title);
        if (!slugTouched) setSlug(slugify(result.title));
      }
    } catch {
      setDocError("Could not upload the document. Please try again.");
    } finally {
      setDocPending(false);
      if (docInputRef.current) docInputRef.current.value = "";
    }
  }

  function handlePublishToggle() {
    if (!post) return;
    const next = status === "published" ? "draft" : "published";
    startTransition(async () => {
      await setPostStatusAction(post.id, next);
      setStatus(next);
    });
  }

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      {isEdit && <input type="hidden" name="id" value={post!.id} />}

      <label className="a-label">
        Title
        <input
          name="title"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          required
          className="a-input"
        />
      </label>

      <label className="a-label">
        Slug
        <input
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          className="a-input mono"
        />
      </label>

      <label className="a-label">
        Excerpt
        <textarea name="excerpt" defaultValue={post?.excerpt} rows={2} className="a-textarea" />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="a-label">
          Type
          <select
            name="type"
            required
            value={type}
            onChange={(event) => setType(event.target.value as BlogType)}
            className="a-input"
          >
            {BLOG_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="a-label">
          Import document (.docx, .pdf)
          <input
            ref={docInputRef}
            type="file"
            accept=".docx,.pdf"
            disabled={docPending}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleDocumentUpload(file);
            }}
            className="a-input"
          />
          <span style={{ fontSize: "0.75rem", color: "var(--text-lo)" }}>
            {docPending ? "Parsing document…" : "Replaces the editor content below."}
          </span>
        </label>
      </div>

      {docError && <p className="a-danger">{docError}</p>}

      <div className="a-label">
        Content
        <TiptapEditor key={editorKey} initialContent={content} onChangeMarkdown={setContent} />
        <input type="hidden" name="content" value={content} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="a-label">
          Categories (comma-separated)
          <input name="categories" defaultValue={post?.categories?.join(", ")} className="a-input" />
        </label>
        <label className="a-label">
          Tags (comma-separated)
          <input name="tags" defaultValue={post?.tags?.join(", ")} className="a-input" />
        </label>
      </div>

      <MediaPicker label="Cover image" value={coverImageUrl} onChange={setCoverImageUrl} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

      <details className="a-panel">
        <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--text-hi)", fontSize: "0.85rem" }}>SEO</summary>
        <div className="mt-3 flex flex-col gap-3">
          <label className="a-label">
            Meta title (falls back to title)
            <input name="metaTitle" defaultValue={post?.seo?.metaTitle ?? ""} placeholder={title} className="a-input" />
          </label>
          <label className="a-label">
            Meta description (falls back to excerpt)
            <textarea name="metaDescription" defaultValue={post?.seo?.metaDescription ?? ""} rows={2} className="a-textarea" />
          </label>
          <label className="a-label">
            OG image URL (falls back to cover image)
            <input name="ogImageUrl" defaultValue={post?.seo?.ogImageUrl ?? ""} className="a-input" />
          </label>
          <label className="a-label">
            Canonical URL (falls back to computed URL)
            <input name="canonicalUrl" defaultValue={post?.seo?.canonicalUrl ?? ""} className="a-input" />
          </label>
        </div>
      </details>

      {state?.error && <p className="a-danger">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="btn primary" style={{ opacity: pending ? 0.6 : 1 }}>
          {pending ? "Saving…" : "Save draft"}
        </button>
        {isEdit && (
          <button type="button" onClick={handlePublishToggle} disabled={isPending} className="btn" style={{ opacity: isPending ? 0.6 : 1 }}>
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
        )}
        {isEdit && <span className={`pill ${status === "published" ? "up" : "flat"}`}>{status}</span>}
      </div>
    </form>
  );
}
