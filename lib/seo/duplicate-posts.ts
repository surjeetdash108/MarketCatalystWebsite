/**
 * Blog posts published more than once, as [copy slug, original slug].
 *
 * The backend de-duplicates a repeated title by suffixing -2, -3..., so
 * re-uploading an article creates a second live copy competing with the first
 * in search. next.config.ts 301s each copy to its original and app/sitemap.ts
 * leaves the copies out. The copies should also be unpublished in the blog
 * admin. Add future duplicates here.
 *
 * Plain data with no imports: next.config.ts loads this at build time.
 */
export const DUPLICATE_POSTS: [copy: string, original: string][] = [
  ["inside-the-hack-where-openai-s-own-ai-agents-went-rogue-2", "inside-the-hack-where-openai-s-own-ai-agents-went-rogue"],
  ["inside-the-hack-where-openai-s-own-ai-agents-went-rogue-3", "inside-the-hack-where-openai-s-own-ai-agents-went-rogue"],
];
