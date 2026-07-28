import { notFound } from "next/navigation";
import { getPostById } from "@/lib/blog/posts";
import { PostEditor } from "@/components/admin/PostEditor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-lg font-semibold">Edit post</h1>
      <PostEditor post={post} />
    </div>
  );
}
