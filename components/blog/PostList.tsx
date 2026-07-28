import type { Post } from "@/lib/blog/posts";
import { PostCard } from "./PostCard";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="text-neutral-500">No posts published yet.</p>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
