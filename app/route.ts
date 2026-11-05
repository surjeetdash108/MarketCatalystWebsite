import { gzipSync } from "node:zlib";
import { homeDocument } from "@/lib/landing/home-document";

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
// prefetch a <Link> target as an app-router page, and here that is an 8 MB
// document on every page that shows the nav.
export const dynamic = "force-static";

// Compressed here, once at build, and sent as gzip to everyone. Next compresses
// its pages and APIs itself but leaves a prerendered route-handler body alone, so
// without this the 8 MB document went out as 8 MB on every visit (about 2.6 MB
// gzipped). Every browser and crawler accepts gzip; only a bare `curl` without
// --compressed would see the encoded bytes.
export function GET() {
  const body = gzipSync(homeDocument(), { level: 9 });
  return new Response(new Uint8Array(body), {
    headers: { "Content-Type": "text/html; charset=utf-8", "Content-Encoding": "gzip" },
  });
}
