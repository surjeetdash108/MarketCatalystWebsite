/**
 * The publish moment and read time of a post, written once (26 Nov 2026
 * audit, B-07 / B-08 / B-09 / B-24).
 *
 * The visible dateline, the listing card, the machine-readable <time datetime>
 * and the JSON-LD `datePublished` all come from the same `publishedAt`
 * instant, in one wording: "Published Nov 24, 2026 · 4:31 PM ET". The zone is
 * fixed to New York rather than the reader's: the page is server-rendered and
 * hydrated, and a zone-dependent string differs between the two. The posts are
 * about the US session, so the closing bell is the useful reference either way.
 *
 * Designed posts print their own date line, written as free text by whoever
 * made them (five wordings were live, some minutes off the real publish time,
 * 51 posts with none). applyDateline() rewrites that line from publishedAt;
 * a post without one gets the site's visible dateline instead.
 */
const ZONE = "America/New_York";

const valid = (iso: string | null | undefined): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "Nov 24, 2026" */
export function formatPublishedDay(iso: string | null | undefined): string | null {
  const d = valid(iso);
  return d ? d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: ZONE }) : null;
}

/** "4:31 PM ET" */
export function formatPublishedClock(iso: string | null | undefined): string | null {
  const d = valid(iso);
  return d ? `${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: ZONE })} ET` : null;
}

/** "Nov 24, 2026 · 4:31 PM ET", or null when the date is missing or unreadable. */
export function formatPublished(iso: string | null | undefined): string | null {
  const day = formatPublishedDay(iso);
  return day ? `${day} · ${formatPublishedClock(iso)}` : null;
}

/** Reading time of a post body (HTML or Markdown), counted the same way everywhere. */
export function readMinutes(content: string): number {
  const text = String(content ?? "")
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .trim();
  const words = text ? text.split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

/** "Published Nov 24, 2026 · 4:31 PM ET · 3 min read" */
export function publishedLine(iso: string | null | undefined, minutes: number): string | null {
  const when = formatPublished(iso);
  return when ? `Published ${when} · ${minutes} min read` : null;
}

const WEEKDAY = "(?:Mon|Tues|Wednes|Thurs|Fri|Satur|Sun)day,?\\s+";
const MONTH_FIRST = "[A-Z][a-z]{2,8}\\.?\\s+\\d{1,2},?\\s+\\d{4}";
const DAY_FIRST = "\\d{1,2}\\s+[A-Z][a-z]{2,8}\\.?\\s+\\d{4}";
const CLOCK = "\\d{1,2}:\\d{2}\\s*(?:[ap]\\.?\\s?m\\.?|AM|PM)?\\s*(?:ET|EST|EDT)";
/** A text node that is a post's own date line, in any wording seen live. */
const DATE_LINE = new RegExp(
  `>(\\s*)((?:Published|Updated)?\\s*:?\\s*(?:${WEEKDAY})?(?:${MONTH_FIRST}|${DAY_FIRST})(?:\\s*[·•|,-]\\s*${CLOCK})?(?:\\s*[·•|]\\s*\\d+\\s*min(?:ute)?s?\\s+read)?)(\\s*)<`,
  "i",
);
/** A date line that lost its date: only "3 min read". */
const READ_ONLY = />(\s*)(\d+\s*min(?:ute)?s?\s+read)(\s*)</i;

/**
 * The post's own date line rewritten to `line`. Only the first one before the
 * first section heading counts (the masthead), and never inside <script> or
 * <style>. `found` is false when the post has none, so the page shows its own.
 */
export function applyDateline(html: string, line: string): { html: string; found: boolean } {
  const head = html.search(/<h2[\s>]/i);
  const end = head >= 0 ? head : html.length;
  const masked = html.slice(0, end).replace(/<(script|style)[\s\S]*?<\/\1>/gi, (m) => " ".repeat(m.length));
  for (const re of [DATE_LINE, READ_ONLY]) {
    const m = re.exec(masked);
    if (!m) continue;
    const at = m.index;
    return { html: `${html.slice(0, at)}>${m[1]}${line}${m[3]}<${html.slice(at + m[0].length)}`, found: true };
  }
  return { html, found: false };
}
