import type { Metadata } from "next";
import { getLivePostSummaries, getPublishedPostListings } from "@/lib/blog/posts";
import { DUPLICATE_POSTS } from "@/lib/seo/duplicate-posts";
import { BlogIndex, type IndexPost } from "@/components/blog/BlogIndex";
import { getWeeklyReads } from "@/lib/blog/stats";
import {
  PER_PAGE,
  postsHref,
  sectionFromSlug,
  sectionOfType,
  type Section,
} from "@/lib/blog/sections";
import { pageMetadata } from "@/lib/seo/og";
import "../blog.css";

// Rendered per-request (this runs on App Hosting, not a static export) so the
// build never depends on Firestore / a composite index being ready. The list
// is small and the query is cheap.
export const dynamic = "force-dynamic";

/** Duplicate copies 301 to their original, so the board must not list them (a card would link to a redirect). */
const duplicateSlugs = new Set(DUPLICATE_POSTS.map(([copy]) => copy));

type SearchParams = Promise<{ page?: string | string[]; section?: string | string[] }>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** `?page=` as a whole number >= 1; anything else is page 1. */
function parsePage(value: string | undefined): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

/**
 * Every listing view is its own URL (/posts, /posts?page=2, /posts?section=recap,
 * /posts?section=recap&page=2) with its own self-referencing canonical, so
 * crawlers can follow the pager and the section filters as ordinary links.
 * The page number is clamped to the real last page for the same reason the board
 * clamps it: ?page=999 must not mint a canonical for a page that does not exist.
 */
async function resolveView(searchParams: SearchParams) {
  const sp = await searchParams;
  const section: Section | "all" = sectionFromSlug(first(sp.section)) ?? "all";
  const requested = parsePage(first(sp.page));
  return { section, requested };
}

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { section, requested } = await resolveView(searchParams);
  // The canonical needs the real page count, which needs the archive size.
  // Same cached read the sitemap uses, so this does not add a Firestore query.
  let page = requested;
  if (page > 1) {
    try {
      const all = await getLivePostSummaries();
      const total = section === "all" ? all.length : all.filter((p) => sectionOfType(p.type) === section).length;
      page = Math.min(page, Math.max(1, Math.ceil(total / PER_PAGE)));
    } catch {
      page = 1;
    }
  }

  const label = section === "all" ? "Blog" : `${section} · Blog`;
  return pageMetadata({
    title: `${label}${page > 1 ? ` · Page ${page}` : ""} · MarketCatalyst`,
    description:
      section === "all"
        ? "Daily recaps, research and guides to how the market actually works."
        : `${section} posts from MarketCatalyst: daily recaps, research and guides to how the market actually works.`,
    path: postsHref(section, page),
  });
}

/* ── Server-side helpers ──────────────────────────────────────────────── */

const ENTITY: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">",
  "&quot;": '"', "&apos;": "'", "&nbsp;": " ",
};

/** Strip HTML/markdown → plain text, for generating card blurbs on the server. */
function toPlainBody(html: string): string {
  return (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (m) => ENTITY[m.toLowerCase()] ?? " ")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z][a-z0-9]*;/gi, " ")
    .replace(/^[#>]+\s*/gm, " ")
    .replace(/[*_`~]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function computeReadMins(content: string): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

function computePreview(excerpt: string, plainBody: string, min: number, max: number): string {
  const cut = (t: string) => (t.length > max ? t.slice(0, max).trimEnd() + "\u2026" : t);
  const summary = (excerpt ?? "").trim();
  if (summary.length >= min) return cut(summary);
  const rest = plainBody.startsWith(summary) ? plainBody.slice(summary.length).trim() : plainBody;
  return cut([summary, rest].filter(Boolean).join(" "));
}

/* ── Page component ───────────────────────────────────────────────────── */

export default async function PostsIndexPage({ searchParams }: { searchParams: SearchParams }) {
  const { section, requested } = await resolveView(searchParams);
  // Both reads are independent, so they go together rather than in sequence.
  const [listed, reads] = await Promise.all([getPublishedPostListings(), getWeeklyReads()]);
  const posts = listed.filter((p) => !duplicateSlugs.has(p.slug));

  // Pre-compute values that require raw content so the client never receives
  // the full HTML body, just the derived display strings.
  //
  // Fields are NAMED, not spread. This used to be `{ ...p, content: "" }`, which
  // blanked the body but still sent every other field of the post, including
  // `documentHtml` (the whole uploaded page) and `css`, for all 270+ posts: 11 MB
  // of RSC payload for a page that draws six cards. Only what the board reads
  // goes to the browser.
  const indexPosts: IndexPost[] = posts.map((p) => {
    const plainBody = toPlainBody(p.content);
    return {
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      type: p.type,
      author: p.author,
      editorsChoice: p.editorsChoice,
      publishedAt: p.publishedAt,
      createdAt: p.createdAt,
      /** Pre-computed reading time. */
      readMin: computeReadMins(p.content),
      /** Pre-computed card blurb for the highlight hero. */
      heroPreview: computePreview(p.excerpt, plainBody, 150, 260),
    };
  });

  // Clamp here as well as in generateMetadata, so the first paint and the
  // canonical agree about which page this URL is.
  const inSection = section === "all" ? indexPosts.length : indexPosts.filter((p) => sectionOfType(p.type) === section).length;
  const initialPage = Math.min(requested, Math.max(1, Math.ceil(inSection / PER_PAGE)));

  return <BlogIndex posts={indexPosts} reads={reads} initialSection={section} initialPage={initialPage} />;
}

