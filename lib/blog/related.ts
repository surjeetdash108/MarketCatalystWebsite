import type { PostSummary } from "@/lib/blog/posts";

/**
 * The posts an article links to at its foot.
 *
 * Built to fix orphaned posts, so the choice is deliberately structural rather
 * than "most similar": within the article's own section (newest first) it links
 * the next-newer post and the next three older ones. Every post is therefore
 * linked FROM its neighbours in both directions, which chains the whole archive
 * together: a crawler that reaches any post can walk to all the others, and no
 * post is left with zero inbound links however old it is. If the section has
 * fewer than `limit` other posts, the newest posts site-wide fill the rest.
 *
 * `all` must be newest-first, as getLivePostSummaries returns it.
 */
export function pickRelatedPosts(all: PostSummary[], slug: string, limit = 4): PostSummary[] {
  const picked: PostSummary[] = [];
  const add = (p: PostSummary | undefined) => {
    if (p && p.slug !== slug && !picked.includes(p) && picked.length < limit) picked.push(p);
  };

  const current = all.find((p) => p.slug === slug);
  if (current) {
    const sameSection = all.filter((p) => p.type === current.type);
    const at = sameSection.findIndex((p) => p.slug === slug);
    // Newer neighbour first (index - 1), then the older ones in order.
    add(sameSection[at - 1]);
    add(sameSection[at + 1]);
    add(sameSection[at + 2]);
    add(sameSection[at + 3]);
  }

  // A post too new for the cache, or a thin section: top up with the latest.
  for (const p of all) add(p);
  return picked;
}
