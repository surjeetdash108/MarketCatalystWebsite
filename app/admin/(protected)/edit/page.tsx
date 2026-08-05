import { notFound, redirect } from "next/navigation";
import { getPostById } from "@/lib/blog/posts";
import { PostEditor } from "@/components/admin/PostEditor";

// /admin/edit?id=<postId> — the canonical edit page. The posts list links here;
// the legacy /admin/posts/<id>/edit route 307-redirects to this.
function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminEditPostPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>;
}) {
  const id = firstParam((await searchParams).id);
  if (!id) redirect("/admin/posts");

  const post = await getPostById(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="a-h1">Edit post</h1>
      <PostEditor post={post} />
    </div>
  );
}
