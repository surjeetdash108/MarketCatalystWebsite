import type { Metadata } from "next";
import { ReaderShell } from "@/components/chrome/ReaderShell";
import { MarketChart } from "@/components/chrome/MarketChart";
import { FeatureBoard } from "@/components/features/FeatureBoard";
import { AI_FEATURES, WORKSPACE_FEATURES } from "@/lib/features/features";
import "../pages.css";
import "../features.css";

export const metadata: Metadata = {
  title: "Features — MarketCatalyst",
  description: `${WORKSPACE_FEATURES.length} research workspaces plus the AI layer that reads every one of them — markets, research, recaps and your own portfolio, each explained.`,
  alternates: { canonical: "/features" },
};

// Fully static: the feature list is content, not data, so there is nothing
// here that needs a request to resolve.
export default function FeaturesIndexPage() {
  return (
    <ReaderShell active="features">
      <main>
        {/* ── Masthead ──────────────────────────────────────────────── */}
        <section className="mcp-hero">
          <div className="mcp-glow" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>

          <div className="mcp-inner mcp-hero-grid">
            <div className="mc-rev">
              <div className="mcp-kicker">
                <i />
                <span>Features · {WORKSPACE_FEATURES.length} workspaces + AI</span>
              </div>
              <h1 className="mcp-h1">
                Everything the terminal does, laid out <span className="mc-serif">inside.</span>
              </h1>
              <p className="mcp-lede">
                Markets, research, recaps and your own workspace — each one read by AI. Pick a
                feature to see what it does.
              </p>
            </div>

            <div className="mc-rev" data-delay="140">
              <MarketChart
                label="FEATURES · OVERVIEW"
                read="Every screen below reads this chart the same way — the AI layer is what explains it, wherever a ticker appears."
              />
            </div>
          </div>
        </section>

        {/* ── AI layer ──────────────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-sec-head mc-rev mc-rev-sm">
              <span className="mcp-sec-n">The AI layer</span>
              <h2 className="mcp-h2">Reads every workspace below</h2>
              <span className="mcp-rule" />
            </div>
            <div className="mcf-ai-grid mc-rev mc-rev-sm">
              {AI_FEATURES.map((f) => (
                <a key={f.slug} href={f.href} className="mcf-ai-card">
                  <span className="mcf-ai-tag">◆ AI · {f.num}</span>
                  <span className="mcf-ai-card-title">{f.title}</span>
                  <p className="mcf-ai-card-blurb">{f.blurb}</p>
                  <span className="mcf-ai-card-go">Explore →</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ── Workspaces ────────────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-sec-head mc-rev mc-rev-sm">
              <span className="mcp-sec-n">Every workspace</span>
              <h2 className="mcp-h2">Filter by where you&rsquo;d use it</h2>
              <span className="mcp-rule" />
            </div>
            <FeatureBoard features={WORKSPACE_FEATURES} />
          </div>
        </section>
      </main>
    </ReaderShell>
  );
}
