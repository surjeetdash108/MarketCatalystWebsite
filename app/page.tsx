import "./home.css";

import { SiteNav } from "@/components/chrome/SiteNav";
import { Hero } from "@/components/home/Hero";
import { HomeMotion } from "@/components/home/HomeMotion";
import { Coverage, FinalCta, PricingPlans, WorkspaceStack } from "@/components/home/Sections";
import { Tape } from "@/components/home/Tape";
import { SiteFooter } from "@/components/chrome/SiteFooter";

// The landing page is server-rendered end to end — copy, tables, pricing and
// the product shot are all real DOM, so they're in the HTML for crawlers.
//
// Four parts hydrate afterwards: <HomeMotion /> (intro loader, cursor
// spotlight, scroll choreography), the workspace panels (their tabs and rows
// are interactive), and <HeroHud /> + <Tape />, which replace their designed
// figures with the live tape once it answers. Nothing on the critical path
// waits for the market — the designed numbers are what the server sends.
export default function Home() {
  return (
    <div className="mc-page">
      {/* With scripting off the loader would never lift and the masked hero
          copy would never animate in, so neutralise both. */}
      <noscript>
        <style>{`.mc-loader{display:none}.mc-mask{transform:none}.mc-fade{opacity:1;transform:none}`}</style>
      </noscript>

      <HomeMotion />
      <SiteNav />
      <Hero />
      <Tape />
      <WorkspaceStack />
      <Coverage />
      <PricingPlans />
      <FinalCta />
      <SiteFooter />
    </div>
  );
}
