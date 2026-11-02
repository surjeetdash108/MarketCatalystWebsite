import Link from "next/link";
import { resolvePostAuthor } from "@/lib/seo/jsonld";

/** Up to two initials from a name, for the avatar. */
function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0]![0]! + words[words.length - 1]![0]! : (words[0] ?? "M").slice(0, 2)).toUpperCase();
}

/**
 * "Written by": who is behind an article, under it, so every post names its
 * author the way the audit asks (and the way the article's JSON-LD already
 * says). The name is the post's `author` field from the blog console; a post
 * with none is signed by the desk. Server-rendered, so it is in the HTML.
 */
export function AuthorBox({ author }: { author?: string | null }) {
  const { name } = resolvePostAuthor({ author });

  return (
    <aside className="post-author" aria-label="About the author">
      <span className="post-author-avatar" aria-hidden="true">
        {initials(name)}
      </span>
      <div className="post-author-body">
        <p className="post-author-k">Written by</p>
        <p className="post-author-name">{name}</p>
        <p className="post-author-bio">
          Market recaps, research and guides from MarketCatalyst, for informational purposes only and not investment
          advice. <Link href="/about">About MarketCatalyst</Link>
        </p>
      </div>
    </aside>
  );
}
