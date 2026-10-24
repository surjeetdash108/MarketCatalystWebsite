import "./home.css";

import { SiteNav } from "@/components/chrome/SiteNav";
import { Hero } from "@/components/home/Hero";
import { HomeMotion } from "@/components/home/HomeMotion";
import dynamicImport from "next/dynamic";
import { Coverage, FinalCta } from "@/components/home/Sections";
import { Tape } from "@/components/home/Tape";
import { SiteFooter } from "@/components/chrome/SiteFooter";

const WorkspaceStack = dynamicImport(
  () => import("@/components/home/Sections").then((m) => m.WorkspaceStack),
  { ssr: true },
);
const PricingPlans = dynamicImport(
  () => import("@/components/home/Sections").then((m) => m.PricingPlans),
  { ssr: true },
);
import { getLiveTape } from "@/lib/market/tape";
import { LatestPosts } from "@/components/home/LatestPosts";
import { getLivePostSummaries, type PostSummary } from "@/lib/blog/posts";

// Rendered per request so the first paint carries the current market figures.
// Not ISR: on App Hosting the background regeneration never completes (Cloud
// Run throttles CPU after the response), which pinned the build-time render —
// placeholders — in place. getLiveTape() is memory-cached for 30s, so this
// costs the backend at most one call per window.
export const dynamic = "force-dynamic";

/** How long the landing page will wait for the post list before drawing without it. */
const LATEST_POSTS_TIMEOUT_MS = 1500;

/**
 * The twelve newest posts, for the "Latest posts" links. Comes from the same
 * five-minute in-memory list the sitemap uses, so it is normally instant; on a
 * cold instance the Firestore read is capped, because a landing page must never
 * wait on the blog. An empty list just hides the section.
 */
async function latestPosts(): Promise<PostSummary[]> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const posts = await Promise.race([
      getLivePostSummaries(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("post list timed out")), LATEST_POSTS_TIMEOUT_MS);
      }),
    ]);
    return posts.slice(0, 12);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

// The landing page is server-rendered end to end — copy, tables, pricing and
// the product shot are all real DOM, so they're in the HTML for crawlers.
//
// The hero HUD and the marquee are server-rendered with the real tape (read
// from the backend's public landing endpoint, memory-cached 30s), then <HeroHud /> and
// <Tape /> poll /api/market/tape to keep them current. If the backend has never
// answered they show placeholders — never invented figures.
export default async function Home() {
  const [tape, latest] = await Promise.all([getLiveTape(), latestPosts()]);

  return (
    <div className="mc-page">
      {/* With scripting off the loader would never lift and the masked hero
          copy would never animate in, so neutralise both. */}
      <noscript>
        <style>{`.mc-loader{display:none}.mc-mask{transform:none}.mc-fade{opacity:1;transform:none}`}</style>
      </noscript>

      <HomeMotion />
      <SiteNav />
      <Hero tape={tape} />
      <Tape initial={tape} />
      <WorkspaceStack />
      <Coverage />
      <PricingPlans />
      <LatestPosts posts={latest} />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}
