import Link from "next/link";
import Image from "next/image";
import { getAllPostsForAdmin } from "@/lib/blog/posts";
import { DeletePostButton } from "@/components/admin/DeletePostButton";

export default async function AdminPostsPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="a-h1">Posts</h1>
        <Link href="/admin/posts/new" className="btn primary">
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="a-panel" style={{ padding: "32px", textAlign: "center", color: "var(--text-dim-solid)" }}>
          No posts yet.
        </div>
      ) : (
        <div className="pcard-grid">
          {posts.map((post) => (
            <div key={post.id} className="pcard">
              <Link href={`/admin/posts/view?id=${post.id}`} className="pcard-thumb" aria-label={post.title}>
                {post.coverImageUrl ? (
                  <Image src={post.coverImageUrl} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" className="object-cover" />
                ) : (
                  <div className="pcard-ph">{(post.title || "?").charAt(0).toUpperCase()}</div>
                )}
              </Link>
              <div className="pcard-body">
                <div className="pcard-meta">
                  <span>{new Date(post.updatedAt).toLocaleDateString()}</span>
                  <span className={`pill ${post.status === "published" ? "up" : "flat"}`} style={{ marginLeft: "auto" }}>
                    {post.status}
                  </span>
                </div>
                <Link href={`/admin/posts/view?id=${post.id}`} className="pcard-title">
                  {post.title}
                </Link>
                {post.excerpt && <div className="pcard-excerpt">{post.excerpt}</div>}
              </div>
              <div className="pcard-actions">
                <Link href={`/admin/posts/view?id=${post.id}`} className="btn sm">View</Link>
                <Link href={`/admin/edit?id=${post.id}`} className="btn sm">Edit</Link>
                <DeletePostButton id={post.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
