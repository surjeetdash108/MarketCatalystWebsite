import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/blog/posts";
import { buildMatcher, countIn, findIn, fold, testIn } from "@/lib/blog/search-match";

/* ── Plain-text search index ──────────────────────────────────────────────
   Built once from Firestore, cached in-process, and shared across all
   concurrent requests. The blog corpus is the same for every reader —
   only the query differs — so there is exactly one index.              */

type IndexEntry = {
  id: string;
  /** Folded plain text: title · excerpt · author · tags · section · body.
   *  What decides whether a post matches. Case is left alone — the matcher is
   *  case-insensitive, and folding has to stay one character to one. */
  hay: string;
  /** The article body as plain text, exactly as written. What the quoted line
   *  is cut from — a hit in the headline should not quote itself back. */
  body: string;
  /** `body` folded, so a request never re-folds 30-odd articles. Same length
   *  as `body`, so an offset found here slices `body` correctly. */
  bodyFolded: string;
};

let indexCache: IndexEntry[] | null = null;
let cacheBuiltAt = 0;
/** Rebuild every 5 minutes — a new post won't appear instantly, but within
 *  a window that is shorter than a reader's attention span. */
const CACHE_TTL_MS = 5 * 60 * 1000;

/** How the board labels each stored type. Searchable, because a reader who
 *  types "educational" means the section. */
const SECTION_LABEL: Record<string, string> = {
  recap: "Recap",
  research: "Research desk",
  educational: "Educational",
};

/* ── HTML / Markdown entity map ──────────────────────────────────────── */

const ENTITY: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">",
  "&quot;": '"', "&apos;": "'", "&nbsp;": " ",
};

/**
 * Strip HTML tags, decode entities, remove markdown syntax, and collapse
 * whitespace.  The result is a search-friendly plain-text string — no
 * `<div>`, no `&#8217;`, no `**bold**`.
 */
function toPlainText(html: string): string {
  return (html ?? "")
    // HTML tags → space
    .replace(/<[^>]+>/g, " ")
    // Markdown image / link syntax → alt text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Named entities
    .replace(
      /&(amp|lt|gt|quot|apos|nbsp);/gi,
      (m) => ENTITY[m.toLowerCase()] ?? " ",
    )
    // Numeric decimal entities
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    // Numeric hex entities
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    // Remaining named entities we don't decode — space is safer than debris
    .replace(/&[a-z][a-z0-9]*;/gi, " ")
    // Markdown heading / blockquote leaders (only at line start)
    .replace(/^[#>]+\s*/gm, " ")
    // Emphasis marks anywhere
    .replace(/[*_`~]+/g, "")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

async function buildIndex(): Promise<IndexEntry[]> {
  const posts = await getPublishedPosts();
  return posts.map((p) => {
    const body = toPlainText(p.content);
    const hay = [
      p.title,
      p.excerpt,
      p.author,
      p.tags.join(" "),
      SECTION_LABEL[p.type] ?? "",
      body,
    ].join(" ");
    return { id: p.id, hay: fold(hay), body, bodyFolded: fold(body) };
  });
}

async function getIndex(): Promise<IndexEntry[]> {
  const now = Date.now();
  if (indexCache && now - cacheBuiltAt < CACHE_TTL_MS) {
    return indexCache;
  }
  indexCache = await buildIndex();
  cacheBuiltAt = now;
  return indexCache;
}

/* ── Quoting the body ─────────────────────────────────────────────────── */

/** Characters of article kept either side of the hit. Enough to read the
 *  sentence around it, short enough to stay one line of mono on a card. */
const LEAD = 70;
const TRAIL = 90;

/**
 * How much of the body to treat as the article's own masthead.
 *
 * Posts drawn from a PDF or Word original open by restating the brand, the
 * title and the standfirst, so the FIRST hit for a word in the headline is
 * almost always in that block — and quoting it hands the reader their own
 * headline back as if it were evidence from inside the piece. Past this
 * offset we are in the article proper.
 */
const MASTHEAD = 260;

/**
 * The line of article to show under the card, cut around a hit.
 *
 * Deliberately a substring rather than a sentence: the browser highlights the
 * query inside whatever comes back by running the SAME matcher over it, so the
 * quote only has to contain the words — spacing and punctuation may differ.
 */
function quote(entry: IndexEntry, rx: RegExp): string {
  const ranges = findIn(entry.bodyFolded, rx);
  if (ranges.length === 0) return "";

  // Prefer a hit in the body proper; fall back to the masthead only if that is
  // the single place the words occur.
  const hit = ranges.find((r) => r.start >= MASTHEAD) ?? ranges[0];
  const { body } = entry;

  let from = Math.max(0, hit.start - LEAD);
  let to = Math.min(body.length, hit.end + TRAIL);

  // Snap both ends to a space so the quote opens and closes on whole words —
  // a window cut blind gives you "…ublished Sep 16", which reads as damage
  // rather than as an excerpt.
  if (from > 0) {
    const sp = body.indexOf(" ", from);
    if (sp > -1 && sp < hit.start) from = sp + 1;
  }
  if (to < body.length) {
    const sp = body.lastIndexOf(" ", to);
    if (sp > hit.end) to = sp;
  }

  return (
    (from > 0 ? "…" : "") +
    body.slice(from, to).trim() +
    (to < body.length ? "…" : "")
  );
}

/* ── Route handler ─────────────────────────────────────────────────── */

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("q") ?? "";

  // One matcher, compiled from the query exactly as the browser compiles it,
  // so "found here" and "highlighted there" can never disagree.
  const rx = buildMatcher(raw);
  if (!rx) {
    return NextResponse.json(
      { ok: true, q: "", results: [] },
      { headers: { "cache-control": "no-store" } },
    );
  }

  try {
    const index = await getIndex();

    // PHRASE matching, not all-terms-anywhere. The board highlights exactly
    // what was typed, so a post that contains "nvidia" and "earnings" in
    // different paragraphs must NOT come back for "nvidia earnings" — it
    // would arrive with nothing to highlight and read as a bug.
    const results = index
      .filter((e) => testIn(e.hay, rx))
      .map((e) => ({
        id: e.id,
        quote: quote(e, rx),
        hits: countIn(e.bodyFolded, rx),
      }));

    // No-store, explicitly. Without it the browser reuses its copy, and a
    // reader who searches the same word after a new post is published gets
    // the previous answer back — with the previous quotes in it.
    return NextResponse.json(
      { ok: true, q: raw, results },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
