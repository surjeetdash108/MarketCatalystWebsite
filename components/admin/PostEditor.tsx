"use client";

import { useActionState, useState, useTransition } from "react";
import { TiptapEditor } from "./TiptapEditor";
import { MediaPicker } from "./MediaPicker";
import { createPostAction, updatePostAction, setPostStatusAction, type ActionState } from "@/app/admin/(protected)/posts/actions";
import { slugify } from "@/lib/blog/slug-client";
import type { Post } from "@/lib/blog/posts";

export function PostEditor({ post }: { post?: Post }) {
  const isEdit = Boolean(post);
  const action = isEdit ? updatePostAction : createPostAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [content, setContent] = useState(post?.content ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
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

      <div className="a-label">
        Content
        <TiptapEditor initialContent={content} onChangeMarkdown={setContent} />
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
