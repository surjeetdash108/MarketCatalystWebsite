import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getPostById } from "@/lib/blog/posts";
import { PostBody } from "@/components/blog/PostBody";

// /admin/posts/view?id=<postId> — read-only admin preview of a post (any
// status), with quick actions to edit or open the live public page.
function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminViewPostPage({
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
      <div className="flex items-center justify-between" style={{ gap: 12, flexWrap: "wrap" }}>
        <h1 className="a-h1">{post.title}</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href={`/admin/edit?id=${post.id}`} className="btn primary">Edit</Link>
          {post.status === "published" && (
            <Link href={`/posts/view?slug=${post.slug}`} target="_blank" rel="noreferrer" className="btn">
              Open public ↗
            </Link>
          )}
          <Link href="/admin/posts" className="btn">Back</Link>
        </div>
      </div>

      <div className="a-panel" style={{ padding: 18 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
          <span className={`pill ${post.status === "published" ? "up" : "flat"}`}>{post.status}</span>
          <span className="a-muted">Updated {new Date(post.updatedAt).toLocaleString()}</span>
          {post.publishedAt && (
            <span className="a-muted">· Published {new Date(post.publishedAt).toLocaleDateString()}</span>
          )}
          <span className="a-muted">· /{post.slug}</span>
        </div>

        {post.coverImageUrl && (
          <div className="relative mb-4 aspect-video w-full overflow-hidden rounded bg-neutral-900">
            <Image src={post.coverImageUrl} alt="" fill className="object-cover" />
          </div>
        )}

        <PostBody markdown={post.content} />
      </div>
    </div>
  );
}
