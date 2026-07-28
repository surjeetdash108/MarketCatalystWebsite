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

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Title</span>
        <input
          name="title"
          value={title}
          onChange={(event) => handleTitleChange(event.target.value)}
          required
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Slug</span>
        <input
          name="slug"
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(slugify(event.target.value));
          }}
          className="rounded border border-neutral-300 px-3 py-2 font-mono text-sm"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Excerpt</span>
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt}
          rows={2}
          className="rounded border border-neutral-300 px-3 py-2"
        />
      </label>

      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium">Content</span>
        <TiptapEditor initialContent={content} onChangeMarkdown={setContent} />
        <input type="hidden" name="content" value={content} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Categories (comma-separated)</span>
          <input
            name="categories"
            defaultValue={post?.categories?.join(", ")}
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Tags (comma-separated)</span>
          <input
            name="tags"
            defaultValue={post?.tags?.join(", ")}
            className="rounded border border-neutral-300 px-3 py-2"
          />
        </label>
      </div>

      <MediaPicker label="Cover image" value={coverImageUrl} onChange={setCoverImageUrl} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl} />

      <details className="rounded border border-neutral-200 p-3">
        <summary className="cursor-pointer text-sm font-medium">SEO</summary>
        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">Meta title (falls back to title)</span>
            <input
              name="metaTitle"
              defaultValue={post?.seo?.metaTitle ?? ""}
              placeholder={title}
              className="rounded border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">Meta description (falls back to excerpt)</span>
            <textarea
              name="metaDescription"
              defaultValue={post?.seo?.metaDescription ?? ""}
              rows={2}
              className="rounded border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">OG image URL (falls back to cover image)</span>
            <input
              name="ogImageUrl"
              defaultValue={post?.seo?.ogImageUrl ?? ""}
              className="rounded border border-neutral-300 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-neutral-500">Canonical URL (falls back to computed URL)</span>
            <input
              name="canonicalUrl"
              defaultValue={post?.seo?.canonicalUrl ?? ""}
              className="rounded border border-neutral-300 px-3 py-2"
            />
          </label>
        </div>
      </details>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save draft"}
        </button>
        {isEdit && (
          <button
            type="button"
            onClick={handlePublishToggle}
            disabled={isPending}
            className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {status === "published" ? "Unpublish" : "Publish"}
          </button>
        )}
        {isEdit && (
          <span className="text-xs uppercase tracking-wide text-neutral-500">{status}</span>
        )}
      </div>
    </form>
  );
}
