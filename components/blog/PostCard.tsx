import Link from "next/link";
import Image from "next/image";
import type { Post } from "@/lib/blog/posts";

export function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/blog/${post.slug}`} className="flex flex-col gap-2 overflow-hidden rounded border border-neutral-200 hover:border-neutral-400">
      {post.coverImageUrl && (
        <div className="relative aspect-video w-full bg-neutral-100">
          <Image src={post.coverImageUrl} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="flex flex-col gap-2 p-5">
        <h2 className="text-lg font-semibold">{post.title}</h2>
        {post.excerpt && <p className="text-sm text-neutral-600">{post.excerpt}</p>}
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="text-xs text-neutral-400">
            {new Date(post.publishedAt).toLocaleDateString()}
          </time>
        )}
      </div>
    </Link>
  );
}
