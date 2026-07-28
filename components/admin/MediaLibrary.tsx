"use client";

import { useState } from "react";
import { MediaUploadForm } from "./MediaUploadForm";
import { MediaGrid } from "./MediaGrid";
import type { MediaItem } from "@/lib/media/library";

export function MediaLibrary({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);

  return (
    <div className="flex flex-col gap-4">
      <MediaUploadForm onUploaded={(item) => setItems((prev) => [item, ...prev])} />
      <MediaGrid items={items} onDeleted={(id) => setItems((prev) => prev.filter((i) => i.id !== id))} />
    </div>
  );
}
