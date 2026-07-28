import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/blog/posts";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          New post
        </Link>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 text-left text-neutral-500">
            <th className="py-2 font-medium">Title</th>
            <th className="py-2 font-medium">Status</th>
            <th className="py-2 font-medium">Updated</th>
            <th className="py-2 font-medium" />
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-b border-neutral-100">
              <td className="py-2">
                <Link href={`/admin/posts/${post.id}/edit`} className="hover:underline">
                  {post.title}
                </Link>
              </td>
              <td className="py-2">
                <span
                  className={`rounded px-2 py-0.5 text-xs uppercase tracking-wide ${
                    post.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {post.status}
                </span>
              </td>
              <td className="py-2 text-neutral-500">{new Date(post.updatedAt).toLocaleString()}</td>
              <td className="py-2 text-right">
                <DeletePostButton id={post.id} />
              </td>
            </tr>
          ))}
          {posts.length === 0 && (
            <tr>
              <td colSpan={4} className="py-6 text-center text-neutral-500">
                No posts yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
