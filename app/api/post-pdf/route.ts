import { NextResponse, type NextRequest } from "next/server";
import { getPublishedPostBySlug } from "@/lib/blog/posts";

/**
 * Streams a published post's source PDF from this origin.
 *
 * The reader's browser draws the pages itself (see components/blog/PostPdf),
 * which means script has to READ the bytes rather than hand a URL to a plugin.
 * A direct fetch of the Storage URL is a cross-origin read, and the bucket
 * sends no CORS headers — so it would be blocked. Proxying keeps the fetch
 * same-origin and leaves the bucket closed to other sites.
 *
 * The caller names a POST, never a URL: the file location is resolved here from
 * the post's own record. Accepting a URL would turn this route into an open
 * proxy that fetches anything the server can reach.
 */

// Storage is the only place a post's PDF can live. Anything else on the doc is
// treated as tampered-with rather than followed.
const ALLOWED_HOST = "firebasestorage.googleapis.com";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug is required" }, { status: 400 });
  }

  // Only published posts. A draft's PDF is not public just because its slug
  // is guessable.
  const post = await getPublishedPostBySlug(slug);
  if (!post?.pdfUrl) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  let target: URL;
  try {
    target = new URL(post.pdfUrl);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  if (target.protocol !== "https:" || target.hostname !== ALLOWED_HOST) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "upstream unavailable" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      // The bytes are immutable — a re-upload writes a new object under a new
      // UUID and the doc points elsewhere — so this can be cached hard. It is
      // public content; the CDN may hold it.
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "Content-Disposition": "inline",
      // The file is drawn into a canvas, never executed or framed.
      "X-Content-Type-Options": "nosniff",
    },
  });
}
