/**
 * Cuts a long headline or slug to a search-friendly length without leaving it
 * hanging mid-phrase ("... Revenue to" / "... and").
 *
 * Plain functions with no imports: lib/seo/shortened-posts.ts is generated with
 * them and next.config.ts loads that file at build time.
 */

/** Longest <title> that search results show in full. */
export const MAX_TITLE_CHARS = 60;

/**
 * Longest post slug. The audit flags URLs over 115 characters and
 * "https://marketcatalyst.ai/posts/" is 32 of them, so 80 leaves a margin
 * for a "-2" suffix on a repeated title.
 */
export const MAX_SLUG_CHARS = 80;

/** Words a new clause starts with: cutting just before one leaves a complete thought. */
const STRONG_STARTERS = new Set([
  "as", "while", "but", "amid", "after", "before", "with", "despite", "because",
  "though", "yet", "which", "who", "following", "since",
]);
const WEAK_STARTERS = new Set(["and", "on", "to", "in", "for", "from", "over", "that", "ahead", "at", "by"]);

/** Words a cut text must not end on. */
const DANGLING = new Set([
  "a", "an", "the", "of", "to", "in", "on", "at", "for", "with", "and", "or", "as", "by", "from", "than",
  "over", "amid", "after", "before", "while", "but", "vs", "is", "are", "its", "their", "his", "her", "into",
  "per", "that", "which", "who", "despite",
  // The "s" of a possessive split off by slugify ("last-year-s").
  "s",
]);

const bare = (token: string) => token.toLowerCase().replace(/[^a-z0-9]/g, "");
const trimTail = (text: string) => text.replace(/[\s,;:–—-]+$/, "");

/**
 * The longest leading run of `tokens` that fits in `max`, preferring to stop
 * before a clause starter ("as", "while", "but"...) or after a comma/colon.
 * Falls back to the last whole word that fits. `ellipsis` marks that fallback
 * as cut off (titles); slugs have nowhere to put one.
 */
function clip(tokens: string[], join: string, max: number, minKeep: number, ellipsis: boolean): string {
  let weak: string | undefined;
  let fallback: string | undefined;
  const room = ellipsis ? max - 1 : max;

  for (let i = tokens.length - 1; i >= 1; i--) {
    const text = trimTail(tokens.slice(0, i).join(join));
    if (text.length > room) continue;
    if (text.length < minKeep && (fallback || weak)) break;
    if (DANGLING.has(bare(tokens[i - 1]!))) continue;

    fallback ??= text;
    const next = bare(tokens[i]!);
    if (/[,;:]$/.test(tokens[i - 1]!) || STRONG_STARTERS.has(next)) {
      if (text.length >= minKeep) return text;
    } else if (WEAK_STARTERS.has(next) && text.length >= minKeep) {
      weak ??= text;
    }
  }

  if (weak) return weak;
  // No clause boundary to stop at: the last whole word that fits.
  const text = fallback ?? tokens[0]!.slice(0, room);
  return ellipsis ? `${text}…` : text;
}

/** A page title of at most `max` characters; shorter titles are returned untouched. */
export function shortenTitle(title: string, max = MAX_TITLE_CHARS): string {
  const clean = title.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return clip(clean.split(" "), " ", max, 28, true);
}

/** A slug of at most `max` characters, cut between words. */
export function shortenSlug(slug: string, max = MAX_SLUG_CHARS): string {
  if (slug.length <= max) return slug;
  return clip(slug.split("-"), "-", max, 30, false);
}
