"use client";

import { useTransition } from "react";
import { deleteMediaAction } from "@/app/admin/(protected)/media/actions";
import type { MediaItem } from "@/lib/media/library";

export function MediaGrid({
  items,
  onSelect,
  onDeleted,
}: {
  items: MediaItem[];
  onSelect?: (item: MediaItem) => void;
  onDeleted?: (id: string) => void;
}) {
  const [pending, startTransition] = useTransition();

  function handleDelete(id: string) {
    if (!window.confirm("Delete this image? This cannot be undone.")) return;
    startTransition(async () => {
      await deleteMediaAction(id);
      onDeleted?.(id);
    });
  }

  if (items.length === 0) {
    return <p className="text-sm text-neutral-500">No images uploaded yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {items.map((item) => (
        <div key={item.id} className="group relative overflow-hidden rounded border border-neutral-200">
          {/* eslint-disable-next-line @next/next/no-img-element -- external Storage URLs, not local assets */}
          <img
            src={item.url}
            alt={item.originalFilename}
            className={`aspect-square w-full object-cover ${onSelect ? "cursor-pointer" : ""}`}
            onClick={() => onSelect?.(item)}
          />
          <button
            type="button"
            onClick={() => handleDelete(item.id)}
            disabled={pending}
            className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
