import { NextResponse } from "next/server";
import { getPublishedPosts } from "@/lib/blog/posts";

/* ── Plain-text search index ──────────────────────────────────────────────
   Built once from Firestore, cached in-process, and shared across all
   concurrent requests. The blog corpus is the same for every reader —
   only the query differs — so there is exactly one index.              */

type IndexEntry = {
  id: string;
  /** Lowercase plain text: title · excerpt · author · tags · body. */
  text: string;
};

let indexCache: IndexEntry[] | null = null;
let cacheBuiltAt = 0;
/** Rebuild every 5 minutes — a new post won't appear instantly, but within
 *  a window that is shorter than a reader's attention span. */
const CACHE_TTL_MS = 5 * 60 * 1000;

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
    const parts = [
      p.title,
      p.excerpt,
      p.author,
      p.tags.join(" "),
      toPlainText(p.content),
    ];
    return {
      id: p.id,
      text: parts.join(" ").toLowerCase(),
    };
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

/* ── Route handler ─────────────────────────────────────────────────── */

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q || q.length < 2) {
    return NextResponse.json({ ok: true, ids: [] });
  }

  try {
    const index = await getIndex();

    // Split into individual terms — every term must appear (AND logic).
    const terms = q.split(/\s+/).filter(Boolean);

    const ids = index
      .filter((entry) => terms.every((t) => entry.text.includes(t)))
      .map((entry) => entry.id);

    return NextResponse.json({ ok: true, ids });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
