"use client";

import { useActionState, useEffect, useRef } from "react";
import { uploadMediaAction, type UploadState } from "@/app/admin/(protected)/media/actions";
import type { MediaItem } from "@/lib/media/library";

export function MediaUploadForm({ onUploaded }: { onUploaded?: (item: MediaItem) => void }) {
  const [state, formAction, pending] = useActionState<UploadState, FormData>(uploadMediaAction, null);
  const formRef = useRef<HTMLFormElement>(null);
  const lastItemId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state?.item && state.item.id !== lastItemId.current) {
      lastItemId.current = state.item.id;
      onUploaded?.(state.item);
      formRef.current?.reset();
    }
  }, [state, onUploaded]);

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-3">
      <input
        type="file"
        name="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        required
        disabled={pending}
        className="text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Upload"}
      </button>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
