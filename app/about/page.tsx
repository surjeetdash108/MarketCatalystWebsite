import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/marketing/Nav";
import { Footer } from "@/components/marketing/Footer";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
// The landing page's own WebGL field — a drifting grid under two animated
// gradient waves. Client-only via the same dynamic loader `app/page.tsx` uses,
// so this page still server-renders its copy for SEO. Reused rather than
// re-invented: the background IS the brand, and a second bespoke one would read
// as a different site.
import GlBackground from "@/components/marketing/GlBackgroundLoader";

export const metadata: Metadata = {
  title: "About — MarketCatalyst",
  description:
    "MarketCatalyst is a market-intelligence platform: institutional-grade data, attributed to source, with the interpretation delivered alongside it.",
  alternates: { canonical: "/about" },
};

/**
 * Headline figures.
 *
 * Every one is measurable in the platform rather than asserted for effect:
 * 38 = the scheduled ingestion jobs in the backend's sync module; 4 = the
 * market-data vendors it integrates (Polygon, FMP, SEC EDGAR, FRED); 10
 * quarters = the earnings history carried per name; 400 days = the longest
 * retention window in the data-governance policy. Keep them honest — if the
 * platform changes, these change with it.
 */
const FIGURES: ReadonlyArray<{ v: string; k: string; d: string }> = [
  { v: "38", k: "Ingestion pipelines", d: "Scheduled jobs feeding the platform each session." },
  { v: "4", k: "Primary sources", d: "Market, fundamental, regulatory and macro." },
  { v: "10", k: "Quarters per name", d: "Reported history behind every earnings view." },
  { v: "400", k: "Days retained", d: "Rolling history under a published policy." },
];

/** The production pipeline, stated as the four things that happen to a number
 *  between the vendor and the screen. */
const PIPELINE: ReadonlyArray<{ n: string; h: string; p: string }> = [
  {
    n: "01",
    h: "Acquisition",
    p: "Pricing, fundamentals, estimates, ratings, ownership, corporate actions and macro series are drawn on their own cadences — intraday where the market demands it, on the filing clock where the regulator sets it.",
  },
  {
    n: "02",
    h: "Normalisation",
    p: "Vendor payloads are reconciled onto a single company record with one identifier, one calendar and one set of units, so figures from different providers can be compared without silently disagreeing.",
  },
  {
    n: "03",
    h: "Derivation",
    p: "Surprise and revision history, relative strength, breadth, regime and clustered analyst conviction are computed in-house from the normalised record — never inherited from a vendor's own scoring.",
  },
  {
    n: "04",
    h: "Interpretation",
    p: "A language model writes the read over that derived record. It explains evidence already present on the screen. It does not forecast, it does not rank, and it does not recommend.",
  },
];

/** The commitments that make the output usable in a professional context. */
const STANDARDS: ReadonlyArray<{ h: string; p: string }> = [
  {
    h: "Attributed by construction",
    p: "Every figure carries the provider that produced it. Provenance is a property of the data model, not a footnote added at the end.",
  },
  {
    h: "Regulatory filings at source",
    p: "Ownership, insider activity and material events are read from EDGAR directly rather than from a summariser's paraphrase of it.",
  },
  {
    h: "Governed retention",
    p: "History is retained under explicit, auditable windows. Forward calendars are structurally excluded from expiry so scheduled events cannot be pruned.",
  },
  {
    h: "Continuous assurance",
    p: "Every endpoint and every upstream vendor is probed on an ongoing basis. Degradation is surfaced as a state of the platform, not discovered by a user.",
  },
];

export default function AboutPage() {
  return (
    <>
      <GlBackground />
      <div className="lp-root mq-root">
        <div className="sp-aurora">
          <i className="a1" />
          <i className="a2" />
          <i className="a3" />
        </div>
        {/* A slow gradient sweep that belongs to this page alone — it sits over
            the shared WebGL field and under the content, so the read has some
            movement of its own without a second competing background. */}
        <div className="ab-beam" aria-hidden="true" />

        <div className="hw">
          <Nav />

          <main className="ab-page">
            {/* ── Positioning ─────────────────────────────────────────── */}
            <header className="ab-hero">
              <div className="mq-kicker">About MarketCatalyst</div>
              <h1 className="ab-title">
                Coverage is solved.
                <br />
                <span className="ab-grad">Comprehension is not.</span>
              </h1>
              <p className="ab-lede">
                MarketCatalyst is a market-intelligence platform for people who have to form a view,
                not just retrieve a number. We assemble institutional-grade data across equities,
                estimates, filings and macro, hold it to a single standard of provenance, and deliver
                the interpretation alongside the evidence rather than leaving it as an exercise for
                the reader.
              </p>
            </header>

            {/* ── Figures ─────────────────────────────────────────────── */}
            <section className="ab-figs">
              {FIGURES.map((f) => (
                <div key={f.k} className="ab-fig">
                  <div className="ab-fig-v">{f.v}</div>
                  <div className="ab-fig-k">{f.k}</div>
                  <p>{f.d}</p>
                </div>
              ))}
            </section>

            {/* ── Thesis ──────────────────────────────────────────────── */}
            <section className="ab-sec">
              <div className="ab-sec-h">
                <span className="ab-sec-n">Our position</span>
                <h2>The constraint moved</h2>
              </div>
              <div className="ab-prose">
                <p>
                  For most of the last decade the binding constraint in market research was access.
                  Fundamentals were expensive, filings were awkward to parse, and real-time pricing
                  was a subscription most participants could not justify. That constraint is gone.
                  Data is abundant, cheap and, in aggregate, largely undifferentiated.
                </p>
                <p>
                  What did not scale with it is interpretation. A screen can tell you a position is
                  down four percent, that consensus moved, that a filing landed after the close — and
                  still leave the analyst to reconstruct, manually and from memory, which of those
                  facts is the cause and which is the coincidence. That reconstruction is the actual
                  work, and it remains almost entirely unautomated.
                </p>
                <p>
                  We treat that gap as the product. The platform is built so that the reasoning
                  travels with the data: the same system that ingests the number is the one that
                  explains it, against the same normalised record, with the source attached.
                </p>
              </div>
            </section>

            {/* ── Pipeline ────────────────────────────────────────────── */}
            <section className="ab-sec">
              <div className="ab-sec-h">
                <span className="ab-sec-n">How it is produced</span>
                <h2>From vendor to view</h2>
              </div>
              <ol className="ab-steps">
                {PIPELINE.map((s) => (
                  <li key={s.n} className="ab-step">
                    <div className="ab-step-n">{s.n}</div>
                    <div className="ab-step-b">
                      <h3>{s.h}</h3>
                      <p>{s.p}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* ── Standards ───────────────────────────────────────────── */}
            <section className="ab-sec">
              <div className="ab-sec-h">
                <span className="ab-sec-n">Standards</span>
                <h2>What we hold ourselves to</h2>
              </div>
              <div className="ab-grid">
                {STANDARDS.map((s) => (
                  <article key={s.h} className="ab-card">
                    <h3>{s.h}</h3>
                    <p>{s.p}</p>
                  </article>
                ))}
              </div>
            </section>

            {/* ── Regulatory posture. Stated plainly and without hedging:
                   in this category, being explicit about what you are not is a
                   mark of seriousness, not a disclaimer to bury. ──────────── */}
            <section className="ab-sec">
              <div className="ab-sec-h">
                <span className="ab-sec-n">Scope</span>
                <h2>Where we draw the line</h2>
              </div>
              <p className="ab-prose ab-line-lede">
                MarketCatalyst is a research and information platform. It is deliberately not an
                advisory business, and the distinction is architectural rather than legal
                boilerplate.
              </p>
              <ul className="ab-line">
                <li>
                  <b>We are not a registered investment adviser.</b> We do not manage client assets
                  and we provide no personalised recommendations. Nothing in the platform is
                  investment advice.
                </li>
                <li>
                  <b>We do not execute.</b> There is no order routing and no brokerage relationship.
                  Research happens here; the trade happens wherever you already trade.
                </li>
                <li>
                  <b>We do not issue calls.</b> The platform explains what the market and the filings
                  say. It does not tell you what to own, and it is not a stock-picking or alert
                  service.
                </li>
                <li>
                  <b>The judgement stays with you.</b> Trading equities and options carries risk.
                  Consult your own financial adviser before acting on anything you read here.
                </li>
              </ul>
            </section>

            {/* ── Close ───────────────────────────────────────────────── */}
            <section className="ab-close">
              <h2>Built to be argued with.</h2>
              <p>
                Every read the platform writes is traceable to the figures underneath it — so you can
                check the reasoning, not just accept it.
              </p>
              <div className="ab-actions">
                <a href={APP_SIGNUP_URL} className="mqp-btn solid ab-btn">
                  Open the terminal →
                </a>
                <Link href="/contact" className="mqp-btn ab-btn">
                  Talk to us
                </Link>
              </div>
              <p className="ab-fine">
                MarketCatalyst is a data and research provider for informational and educational
                purposes only — not investment advice.
              </p>
            </section>
          </main>

          <Footer />
        </div>
      </div>
    </>
  );
}
