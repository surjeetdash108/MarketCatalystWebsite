import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { Pricing } from "@/components/marketing/Pricing";
import { CtaBand } from "@/components/marketing/CtaBand";
import { Footer } from "@/components/marketing/Footer";
// Both of these touch the browser directly (canvas/WebGL, ResizeObserver,
// window scroll measurement) and are purely decorative/interactive, so
// they're excluded from the server render entirely (via a client-only
// `next/dynamic` loader, see GlBackgroundLoader.tsx / WorkspaceCarouselLoader.tsx)
// rather than dragging the whole page into the client bundle. Everything
// else below (Nav copy, Hero text, Pricing, Footer) still server-renders
// for SEO.
import GlBackground from "@/components/marketing/GlBackgroundLoader";
import WorkspaceCarousel from "@/components/marketing/WorkspaceCarouselLoader";

export default function Home() {
  return (
    <>
      <GlBackground />
      <div className="lp-root mq-root">
        <div className="sp-aurora">
          <i className="a1" />
          <i className="a2" />
          <i className="a3" />
        </div>
        <div className="hw">
          <Nav />
          <Hero />
          <WorkspaceCarousel />
          <Pricing />
          <CtaBand />
          <Footer />
        </div>
      </div>
    </>
  );
}
