import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/blog/posts";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { getWeeklyReads } from "@/lib/blog/stats";
import "./blog-index.css";

// Rendered per-request (this runs on App Hosting, not a static export) so the
// build never depends on Firestore / a composite index being ready. The list
// is small and the query is cheap.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog · MarketCatalyst",
  description: "Daily recaps, single-stock research and guides to how the market actually works.",
  alternates: { canonical: "/posts" },
};

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

export default async function PostsIndexPage() {
  // Both reads are independent, so they go together rather than in sequence.
  const [posts, reads] = await Promise.all([getPublishedPosts(), getWeeklyReads()]);

  // Pre-compute values that require raw content so the client never receives
  // the full HTML body — just the derived display strings.
  const indexPosts = posts.map((p) => {
    const plainBody = toPlainBody(p.content);
    return {
      ...p,
      // Replace heavy raw content with an empty string — the client doesn't
      // need it for the index page. Individual article pages fetch their own.
      content: "",
      /** Pre-computed reading time. */
      readMin: computeReadMins(p.content),
      /** Pre-computed card blurb for the highlight hero. */
      heroPreview: computePreview(p.excerpt, plainBody, 150, 260),
    };
  });

  return <BlogIndex posts={indexPosts} reads={reads} />;
}

