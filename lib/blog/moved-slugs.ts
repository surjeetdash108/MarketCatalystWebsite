/**
 * Where a post link that matches no stored slug most likely points (26 Nov
 * 2026 audit, B-01).
 *
 * Posts are created by the backend, which cuts a title's slug to 80
 * characters between words and never ends it on a joining word ("…-to",
 * "…-as"). Writers that built a link from the full title produced a slug the
 * post was never stored under, so the link 404'd. These are the slugs such a
 * link could have meant, most likely first; the page 301s to the first one
 * that is a published post, so every such link lands on its article.
 *
 * Keep BACKEND_SLUG_RULE in step with blogSlug() in the backend
 * (src/blogs/blog-slug.ts).
 */
import { shortenSlug } from "../seo/shorten";

const BACKEND_MAX = 80;
const JOINING = /^(a|an|the|of|to|in|on|at|for|with|and|or|as|by|from|than|over|amid|after|while|but|s)$/;

/** The backend's slug cut (blogSlug), applied to an already-slugified string. */
export function backendSlugCut(slug: string): string {
  if (slug.length <= BACKEND_MAX) return slug;
  const words = slug.split("-");
  while (words.length > 1 && (words.join("-").length > BACKEND_MAX || JOINING.test(words[words.length - 1]!))) {
    words.pop();
  }
  return words.join("-");
}

/** Candidate stored slugs for a request slug that matched nothing, most likely first. */
export function movedSlugCandidates(slug: string): string[] {
  const out: string[] = [];
  for (const c of [backendSlugCut(slug), shortenSlug(slug)]) {
    if (c && c !== slug && !out.includes(c)) out.push(c);
  }
  return out;
}
