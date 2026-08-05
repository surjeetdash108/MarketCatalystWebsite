import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/blog/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/posts/view?slug=${post.slug}`} className="pcard">
      <div className="pcard-thumb">
        {post.coverImageUrl ? (
          <Image src={post.coverImageUrl} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" className="object-cover" />
        ) : (
          <div className="pcard-ph">{(post.title || "?").charAt(0).toUpperCase()}</div>
        )}
      </div>
      <div className="pcard-body">
        {post.publishedAt && (
          <div className="pcard-meta">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </time>
          </div>
        )}
        <div className="pcard-title">{post.title}</div>
        {post.excerpt && <div className="pcard-excerpt">{post.excerpt}</div>}
      </div>
    </Link>
  );
}
