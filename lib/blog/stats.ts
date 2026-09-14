import "server-only";
import { adminFirestore } from "@/lib/firebase/admin";
import { isoWeek } from "@/app/api/blog/track/route";

/**
 * How often each post was opened this week.
 *
 * Read by the board so "Most read this week" is a measurement rather than a
 * label — it used to be the four newest posts under a heading that claimed
 * otherwise. Counts are written by /api/blog/track when a card is clicked.
 *
 * Returns {} on any failure: an empty result makes the board fall back to the
 * newest posts, which is a reasonable list and never an error page.
 */
export async function getWeeklyReads(): Promise<Record<string, number>> {
  try {
    const doc = await adminFirestore.collection("blog_stats").doc(isoWeek()).get();
    if (!doc.exists) return {};
    const posts = (doc.data()?.posts ?? {}) as Record<string, unknown>;
    const out: Record<string, number> = {};
    for (const [slug, n] of Object.entries(posts)) {
      if (typeof n === "number" && n > 0) out[slug] = n;
    }
    return out;
  } catch {
    return {};
  }
}
