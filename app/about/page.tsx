import type { Metadata } from "next";
import Link from "next/link";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { ReaderShell } from "@/components/chrome/ReaderShell";
import { MarketChart } from "@/components/chrome/MarketChart";
import "../pages.css";

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

/** Where the platform stops. Stated plainly and without hedging: in this
 *  category, being explicit about what you are not is a mark of seriousness,
 *  not a disclaimer to bury. */
const SCOPE: ReadonlyArray<{ b: string; p: string }> = [
  {
    b: "We are not a registered investment adviser.",
    p: "We do not manage client assets and we provide no personalised recommendations. Nothing in the platform is investment advice.",
  },
  {
    b: "We do not execute.",
    p: "There is no order routing and no brokerage relationship. Research happens here; the trade happens wherever you already trade.",
  },
  {
    b: "We do not issue calls.",
    p: "The platform explains what the market and the filings say. It does not tell you what to own, and it is not a stock-picking or alert service.",
  },
  {
    b: "The judgement stays with you.",
    p: "Trading equities and options carries risk. Consult your own financial adviser before acting on anything you read here.",
  },
];

// Server-rendered end to end — every word of the argument is in the HTML.
// ReaderShell is the only client part: it owns the light/dark switch and the
// scroll chrome that the nav and progress hairline read from.
export default function AboutPage() {
  return (
    <ReaderShell active="about">
      <main>
        {/* ── Positioning ───────────────────────────────────────────── */}
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
                <span>About MarketCatalyst</span>
              </div>
              <h1 className="mcp-h1">
                Coverage is solved.{" "}
                <span className="mc-serif">Comprehension is not.</span>
              </h1>
              <p className="mcp-lede">
                MarketCatalyst is a market-intelligence platform for people who have to form a view,
                not just retrieve a number. We assemble institutional-grade data across equities,
                estimates, filings and macro, hold it to a single standard of provenance, and deliver
                the interpretation alongside the evidence rather than leaving it as an exercise for
                the reader.
              </p>
              <div className="mcp-actions">
                <a className="mcp-cta" href={APP_SIGNUP_URL}>
                  Open the terminal <i>→</i>
                </a>
                <Link className="mcp-cta-ghost" href="/contact">
                  Talk to us
                </Link>
              </div>
            </div>

            <div className="mc-rev" data-delay="140">
              <MarketChart />
            </div>
          </div>
        </section>

        {/* ── Figures ───────────────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-figs mc-rev mc-rev-sm">
              {FIGURES.map((f) => (
                <div key={f.k} className="mcp-fig">
                  <div className="mcp-fig-v">{f.v}</div>
                  <div className="mcp-fig-k">{f.k}</div>
                  <p>{f.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Thesis ────────────────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-sec-head mc-rev mc-rev-sm">
              <span className="mcp-sec-n">Our position</span>
              <h2 className="mcp-h2">The constraint moved</h2>
              <span className="mcp-rule" />
            </div>
            <div className="mcp-prose mc-rev mc-rev-sm">
              <div>
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
                  facts is the cause and which is the coincidence.
                </p>
              </div>
              <div>
                <p>
                  That reconstruction is the actual work, and it remains almost entirely unautomated.
                  It is also the part that does not survive a busy morning: the reasoning gets done
                  once, in someone&rsquo;s head, and is gone by the time anyone asks how the view was
                  formed.
                </p>
                <p>
                  <b>We treat that gap as the product.</b> The platform is built so that the reasoning
                  travels with the data: the same system that ingests the number is the one that
                  explains it, against the same normalised record, with the source attached.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pipeline ──────────────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-sec-head mc-rev mc-rev-sm">
              <span className="mcp-sec-n">How it is produced</span>
              <h2 className="mcp-h2">From vendor to view</h2>
              <span className="mcp-rule" />
            </div>
            <ol className="mcp-steps mc-rev mc-rev-sm">
              {PIPELINE.map((s) => (
                <li key={s.n} className="mcp-step">
                  <div className="mcp-step-n">{s.n}</div>
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Standards ─────────────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-sec-head mc-rev mc-rev-sm">
              <span className="mcp-sec-n">Standards</span>
              <h2 className="mcp-h2">What we hold ourselves to</h2>
              <span className="mcp-rule" />
            </div>
            <div className="mcp-cards mc-rev mc-rev-sm">
              {STANDARDS.map((s) => (
                <article key={s.h} className="mcp-card">
                  <h3>{s.h}</h3>
                  <p>{s.p}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Scope ─────────────────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-sec-head mc-rev mc-rev-sm">
              <span className="mcp-sec-n">Scope</span>
              <h2 className="mcp-h2">Where we draw the line</h2>
              <span className="mcp-rule" />
            </div>
            <p className="mcp-lede mc-rev mc-rev-sm" style={{ marginTop: 0, marginBottom: 26 }}>
              MarketCatalyst is a research and information platform. It is deliberately not an
              advisory business, and the distinction is architectural rather than legal boilerplate.
            </p>
            <ul className="mcp-line mc-rev mc-rev-sm">
              {SCOPE.map((s) => (
                <li key={s.b}>
                  <span>
                    <b>{s.b}</b>
                    {s.p}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Close ─────────────────────────────────────────────────── */}
        <section className="mcp-close">
          <div className="mcp-glow" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <h2 className="mc-rev">
            Built to be <span className="mc-serif">argued with.</span>
          </h2>
          <p className="mc-rev mc-rev-sm">
            Every read the platform writes is traceable to the figures underneath it — so you can
            check the reasoning, not just accept it.
          </p>
          <div className="mcp-actions mc-rev mc-rev-sm">
            <a className="mcp-cta" href={APP_SIGNUP_URL}>
              Open the terminal <i>→</i>
            </a>
            <Link className="mcp-cta-ghost" href="/posts">
              Read the research
            </Link>
          </div>
          <p className="mcp-fine">
            MarketCatalyst is a data and research provider for informational and educational purposes
            only — not investment advice.
          </p>
        </section>
      </main>
    </ReaderShell>
  );
}
