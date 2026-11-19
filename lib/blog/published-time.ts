/**
 * The publish moment of a post, written once.
 *
 * The visible byline, the machine-readable <time datetime> and the JSON-LD
 * `datePublished` all come from the same `publishedAt` instant, so they cannot
 * disagree. The wording is fixed to New York rather than the reader's zone:
 * the page is server-rendered and hydrated, and a zone-dependent string
 * differs between the two. The posts are about the US session, so the closing
 * bell is the useful reference either way.
 */
const ZONE = "America/New_York";

/** "November 14, 2026 · 10:30 ET", or null when the date is missing or unreadable. */
export function formatPublished(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const when = new Date(iso);
  if (Number.isNaN(when.getTime())) return null;
  const date = when.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric", timeZone: ZONE,
  });
  const time = when.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ZONE,
  });
  return `${date} · ${time} ET`;
}
