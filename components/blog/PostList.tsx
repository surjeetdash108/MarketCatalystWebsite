import type { Post } from "@/lib/blog/posts";
import { PostCard } from "./PostCard";

export function PostList({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return (
      <div className="a-panel" style={{ padding: "32px", textAlign: "center", color: "var(--text-dim-solid)" }}>
        No posts published yet.
      </div>
    );
  }

  return (
    <div className="pcard-grid">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
