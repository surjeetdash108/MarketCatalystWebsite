import { NextResponse } from "next/server";
import { getLiveTape, TAPE_MAX_AGE } from "@/lib/market/tape";

/**
 * The landing page's live figures.
 *
 * Deliberately tiny and deliberately cached. The hero renders its designed
 * numbers server-side and calls this once after hydration, so nothing on the
 * critical path waits for the market: a slow or missing answer here costs the
 * visitor nothing but the live numbers.
 *
 * `stale-while-revalidate` is the important header — the CDN keeps handing out
 * the last good body while one request behind it refreshes, so a visitor never
 * pays for the upstream read.
 */
// Rendered per request, NOT ISR. On App Hosting an ISR route regenerates in the
// background after responding, and Cloud Run throttles the CPU once the
// response is sent, so the regeneration never completes and the build-time
// body ({ ok: false }) was served indefinitely (x-nextjs-cache: STALE).
// Per-request is cheap: getLiveTape() answers from its 30s in-memory cache, and
// the Cache-Control below lets the CDN absorb repeat hits.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const tape = await getLiveTape();

  if (!tape) {
    // 200, not an error status: "no live data" is an ordinary outcome the
    // client handles by keeping what it already has on screen.
    return NextResponse.json(
      { ok: false },
      { headers: { "cache-control": "public, max-age=5, s-maxage=10" } },
    );
  }

  return NextResponse.json(
    { ok: true, ...tape },
    {
      headers: {
        "cache-control": `public, max-age=${TAPE_MAX_AGE}, s-maxage=${TAPE_MAX_AGE}, stale-while-revalidate=300`,
      },
    },
  );
}
