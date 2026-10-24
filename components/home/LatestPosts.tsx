import Link from "next/link";
import { sectionOfType } from "@/lib/blog/sections";
import type { PostSummary } from "@/lib/blog/posts";

/**
 * "Latest posts" on the landing page: plain server-rendered links to the newest
 * posts. The homepage linked to ZERO posts before, so a new article was reachable
 * only from the sitemap and the paged blog index. The links sit in the HTML, so
 * crawlers get them on the first fetch. Renders nothing for an empty list, so a
 * failed post read never leaves a hole in the page.
 */
export function LatestPosts({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mc-latest-posts" aria-labelledby="mc-latest-posts-h">
      <div className="mc-inner">
        <div className="mc-head-row">
          <div>
            <div className="mc-kicker">From the blog</div>
            <h2 className="mc-h2" id="mc-latest-posts-h">
              Latest <span className="mc-serif">posts</span>
            </h2>
          </div>
          <Link className="mc-head-note mc-latest-all" href="/posts">
            All posts →
          </Link>
        </div>

        <ul className="mc-latest-list">
          {posts.map((p) => (
            <li key={p.id}>
              <Link className="mc-latest-link" href={`/posts/${encodeURIComponent(p.slug)}`}>
                <span className="mc-latest-kind">
                  {sectionOfType(p.type)}
                  {" · "}
                  {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    // Fixed zone: server-rendered and hydrated, and a
                    // zone-dependent string differs between the two.
                    timeZone: "America/New_York",
                  })}
                </span>
                <span className="mc-latest-title">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
