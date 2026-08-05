import Link from "next/link";
import { getAllPostsForAdmin } from "@/lib/blog/posts";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="a-h1">Posts</h1>
        <Link href="/admin/posts/new" className="btn primary">
          New post
        </Link>
      </div>

      <div className="a-panel" style={{ padding: "6px 14px" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link href={`/admin/posts/${post.id}/edit`} style={{ color: "var(--text-hi)", fontWeight: 600 }}>
                    {post.title}
                  </Link>
                </td>
                <td>
                  <span className={`pill ${post.status === "published" ? "up" : "flat"}`}>{post.status}</span>
                </td>
                <td className="a-muted">{new Date(post.updatedAt).toLocaleString()}</td>
                <td style={{ textAlign: "right" }}>
                  <DeletePostButton id={post.id} />
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={4} className="a-muted" style={{ textAlign: "center", padding: "24px 0" }}>
                  No posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
