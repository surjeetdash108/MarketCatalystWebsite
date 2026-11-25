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
  // 24 Nov 2026 audit (B-06): the same quarter written up twice. Duke's copy was
  // written for DUKB, a Duke note, not the common stock.
  ["duke-energy-corporation-5-625-beats-q3-2026-estimates-as-revenue-rises-6-6-to-9", "duke-energy-beats-q3-2026-estimates-as-revenue-rises-5-0-to-9-10b"],
  ["northwest-natural-beats-q3-2026-estimates-as-revenue-rises-8-0-to-178-0m-2", "northwest-natural-beats-q3-2026-estimates-as-revenue-rises-8-0-to-178-0m"],
  ["northwestern-energy-q3-2026-revenue-tops-estimates-at-423-8m-but-eps-misses-at-0-2", "northwestern-energy-q3-2026-revenue-tops-estimates-at-423-8m-but-eps-misses-at-0"],
];
