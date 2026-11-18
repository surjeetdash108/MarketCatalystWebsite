import { gzipSync } from "node:zlib";
import { getLivePostSummaries } from "@/lib/blog/posts";
import { homeDocument, type HomePost } from "@/lib/landing/home-document";
import { loadCatalog } from "@/lib/pricing/catalog";

// The home page: the self-contained landing document in lib/landing/home.html
// (see lib/landing/home-document.ts). It replaced the React page that used to
// live in app/page.tsx; git history has that version.
//
// Built once at `next build` and served as a static response, so there is no
// per-request work and no runtime file read. A route handler rather than a file
// in public/ so the site-wide <head> tags can be added from the same constants
// the layout uses, and so there is no second public URL for the same page.
//
// Anything that links to "/" must use a plain <a>, not <Link>: Next would
// prefetch a <Link> target as an app-router page and pull the whole document
// (about 220 KB since scripts/slim-home.mjs moved the fonts, hero image and tour
// script out to /landing; it was 8 MB before) on every page that shows the nav.
//
// Pricing tiles are filled from the backend plan catalog (GET /plans), so the
// page is regenerated hourly instead of once per build: a price change in the
// catalog reaches the website without a website deploy. The same hourly pass
// refreshes the "Latest market recaps" links.
export const revalidate = 3600;

// Compressed here, once at build, and sent as gzip to everyone. Next compresses
// its pages and APIs itself but leaves a prerendered route-handler body alone, so
// without this the 8 MB document went out as 8 MB on every visit (about 2.6 MB
// gzipped). Every browser and crawler accepts gzip; only a bare `curl` without
// --compressed would see the encoded bytes.
/** The three newest daily recaps for the "Latest market recaps" section; none if the read fails. */
async function latestRecaps(): Promise<HomePost[]> {
  try {
    const posts = await getLivePostSummaries();
    return posts
      .filter((p) => p.type === "recap")
      .slice(0, 3)
      .map((p) => ({ title: p.title, slug: p.slug, publishedAt: p.publishedAt }));
  } catch {
    return [];
  }
}

export async function GET() {
  const [{ plans }, recaps] = await Promise.all([loadCatalog(), latestRecaps()]);
  const body = gzipSync(homeDocument(plans, recaps), { level: 9 });
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Content-Encoding": "gzip" },
  });
}
