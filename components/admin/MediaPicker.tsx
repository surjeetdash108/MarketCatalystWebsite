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
    <div className="a-label">
      {label}
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- external Storage URL
        <img src={value} alt="" className="h-32 w-auto object-cover" style={{ borderRadius: 10, border: "1px solid var(--border)" }} />
      ) : (
        <div
          className="flex h-32 w-48 items-center justify-center a-muted"
          style={{ borderRadius: 10, border: "1px dashed var(--border-strong)" }}
        >
          No image selected
        </div>
      )}
      <div className="flex gap-2">
        <button type="button" onClick={open} className="btn sm">
          {value ? "Change image" : "Choose image"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="btn sm">
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
          <div
            className="iq-root"
            data-theme="dark"
            style={{ position: "fixed", inset: 0, zIndex: 50, height: "auto", overflow: "visible", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(4,6,12,0.72)", padding: 24 }}
          >
            <div
              className="flex max-h-[80vh] w-full max-w-3xl flex-col gap-4 overflow-y-auto"
              style={{ background: "var(--surface-1)", border: "1px solid var(--border-strong)", borderRadius: 14, padding: 20, position: "relative", zIndex: 1 }}
            >
              <div className="flex items-center justify-between">
                <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: "var(--text-hi)" }}>Select an image</h2>
                <button type="button" onClick={() => setIsOpen(false)} className="btn sm">
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
                <p className="a-muted">Loading…</p>
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
