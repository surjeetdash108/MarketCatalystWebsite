"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { listMediaAction } from "@/app/admin/(protected)/media/actions";
import { MediaUploadForm } from "./MediaUploadForm";
import { MediaGrid } from "./MediaGrid";
import type { MediaItem } from "@/lib/media/library";

export function MediaPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function open() {
    setIsOpen(true);
    if (items === null) {
      setLoading(true);
      const list = await listMediaAction();
      setItems(list);
      setLoading(false);
    }
  }

  function selectItem(item: MediaItem) {
    onChange(item.url);
    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- external Storage URL
        <img src={value} alt="" className="h-32 w-auto rounded border border-neutral-200 object-cover" />
      ) : (
        <div className="flex h-32 w-48 items-center justify-center rounded border border-dashed border-neutral-300 text-xs text-neutral-400">
          No image selected
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={open}
          className="rounded border border-neutral-300 px-3 py-1.5 text-sm font-medium"
        >
          {value ? "Change image" : "Choose image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600"
          >
            Remove
          </button>
        )}
      </div>

      {isOpen &&
        createPortal(
          // Portalled to document.body — this modal contains its own
          // <form> (MediaUploadForm), and PostEditor's cover-image picker
          // is rendered inside PostEditor's own <form>. Nested <form>
          // elements are invalid HTML and trigger a hydration error, so
          // this can't just render inline here.
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-6">
            <div className="flex max-h-[80vh] w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded bg-white p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold">Select an image</h2>
                <button type="button" onClick={() => setIsOpen(false)} className="text-sm text-neutral-500">
                  Close
                </button>
              </div>
              <MediaUploadForm
                onUploaded={(item) => {
                  setItems((prev) => [item, ...(prev ?? [])]);
                  selectItem(item);
                }}
              />
              {loading ? (
                <p className="text-sm text-neutral-500">Loading…</p>
              ) : (
                <MediaGrid
                  items={items ?? []}
                  onSelect={selectItem}
                  onDeleted={(id) => setItems((prev) => (prev ?? []).filter((i) => i.id !== id))}
                />
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
