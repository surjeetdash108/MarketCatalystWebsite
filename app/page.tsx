import "./home.css";

import { SiteNav } from "@/components/chrome/SiteNav";
import { Hero } from "@/components/home/Hero";
import { HomeMotion } from "@/components/home/HomeMotion";
import { Coverage, FinalCta, PricingPlans, WorkspaceStack } from "@/components/home/Sections";
import { Tape } from "@/components/home/Tape";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { getLiveTape } from "@/lib/market/tape";

// Rendered per request so the first paint carries the current market figures.
// Not ISR: on App Hosting the background regeneration never completes (Cloud
// Run throttles CPU after the response), which pinned the build-time render —
// placeholders — in place. getLiveTape() is memory-cached for 30s, so this
// costs the backend at most one call per window.
export const dynamic = "force-dynamic";

// The landing page is server-rendered end to end — copy, tables, pricing and
// the product shot are all real DOM, so they're in the HTML for crawlers.
//
// The hero HUD and the marquee are server-rendered with the real tape (read
// from the backend's public landing endpoint, memory-cached 30s), then <HeroHud /> and
// <Tape /> poll /api/market/tape to keep them current. If the backend has never
// answered they show placeholders — never invented figures.
export default async function Home() {
  const tape = await getLiveTape();

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
      <FinalCta />
      <SiteFooter />
    </div>
  );
}
