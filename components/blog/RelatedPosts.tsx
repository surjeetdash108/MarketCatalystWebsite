import Link from "next/link";
import { getLivePostSummaries, type PostSummary } from "@/lib/blog/posts";
import { pickRelatedPosts } from "@/lib/blog/related";
import { sectionOfType } from "@/lib/blog/sections";

/**
 * "Keep reading": real links to neighbouring posts at the foot of an article.
 * Server-rendered, so they are in the HTML a crawler fetches (see
 * lib/blog/related.ts for which posts and why).
 *
 * Never breaks the article it sits under: if the post list cannot be read it
 * renders nothing.
 */
export async function RelatedPosts({ slug }: { slug: string }) {
  let related: PostSummary[] = [];
  try {
    related = pickRelatedPosts(await getLivePostSummaries(), slug);
  } catch {
    return null;
  }
  if (related.length === 0) return null;

  return (
    <nav className="post-related" aria-labelledby="post-related-h">
      <h2 id="post-related-h" className="post-related-h">
        Keep reading
      </h2>
      <ul className="post-related-list">
        {related.map((p) => (
          <li key={p.id}>
            <Link className="post-related-link" href={`/posts/${encodeURIComponent(p.slug)}`}>
              <span className="post-related-kind">
                {sectionOfType(p.type)}
                {" · "}
                {new Date(p.publishedAt ?? p.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  // Fixed zone: this renders on the server and is hydrated, and
                  // a zone-dependent string differs between the two.
                  timeZone: "America/New_York",
                })}
              </span>
              <span className="post-related-title">{p.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
