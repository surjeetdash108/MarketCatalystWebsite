import { listMedia } from "@/lib/media/library";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export default async function MediaLibraryPage() {
  const items = await listMedia();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="a-h1">Media library</h1>
      <MediaLibrary initialItems={items} />
    </div>
  );
}
