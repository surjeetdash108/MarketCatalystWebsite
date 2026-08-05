import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedPosts } from "@/lib/blog/posts";

// Rendered per-request (this runs on App Hosting, not a static export) so the
// build never depends on Firestore / a composite index being ready. The list
// is small and the query is cheap.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blogs — MarketCatalyst",
  description: "Market analysis, product updates, and insights from the MarketCatalyst team.",
  alternates: { canonical: "/posts" },
};

export default async function PostsIndexPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="a-h1">Blogs</h1>

      <div className="a-panel" style={{ padding: "6px 14px" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Title</th>
              <th>Published</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link href={`/posts/view?slug=${post.slug}`} style={{ color: "var(--text-hi)", fontWeight: 600 }}>
                    {post.title}
                  </Link>
                  {post.excerpt && (
                    <div className="a-muted" style={{ fontSize: ".8rem", marginTop: 3, maxWidth: 620 }}>
                      {post.excerpt}
                    </div>
                  )}
                </td>
                <td className="a-muted" style={{ whiteSpace: "nowrap", verticalAlign: "top" }}>
                  {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td colSpan={2} className="a-muted" style={{ textAlign: "center", padding: "24px 0" }}>
                  No posts published yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
