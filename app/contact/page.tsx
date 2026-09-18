import type { Metadata } from "next";
import Link from "next/link";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { ReaderShell } from "@/components/chrome/ReaderShell";
import { ContactForm } from "@/components/forms/ContactForm";
import "../pages.css";

export const metadata: Metadata = {
  title: "Contact — MarketCatalyst",
  description:
    "Get in touch with the MarketCatalyst team — product questions, partnerships, press and support.",
  alternates: { canonical: "/contact" },
};

/**
 * The routes a message can take, stated plainly so nobody has to guess which
 * inbox their note lands in. `d` is the realistic response window, not a
 * marketing promise — keep it honest.
 */
const CHANNELS: ReadonlyArray<{ n: string; h: string; p: string; d: string }> = [
  {
    n: "01",
    h: "Product & support",
    p: "Coverage questions, data discrepancies, or anything the terminal is doing that it should not.",
    d: "Within one business day",
  },
  {
    n: "02",
    h: "Partnerships",
    p: "Data providers, distribution, and teams who want the platform behind their own research.",
    d: "Within two business days",
  },
  {
    n: "03",
    h: "Press",
    p: "Commentary, methodology questions, and anything about how a read is produced.",
    d: "Same week",
  },
];

/** What happens to a note after it is sent — the form's counterpart to the
 *  site's provenance claim: no black boxes, including this one. */
const EXPECT: ReadonlyArray<{ h: string; p: string }> = [
  {
    h: "A person reads it",
    p: "Every message goes to the team that owns the answer — not an autoresponder, and not a queue that closes itself after a week.",
  },
  {
    h: "One thread, not five",
    p: "We reply from a single address and keep the history in one place, so a follow-up never restarts the conversation from scratch.",
  },
  {
    h: "Nothing resold",
    p: "What you send is used to answer you. Your details are never passed to a third party or added to a marketing list you did not ask for.",
  },
];

// The page is server-rendered end to end — copy, channels and headings are
// real DOM. Only the shell (theme switch, scroll chrome) and the form itself
// hydrate afterwards.
export default function ContactPage() {
  return (
    <ReaderShell>
      <main>
        {/* ── Hero + form ───────────────────────────────────────────── */}
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
                <span>Contact</span>
              </div>
              <h1 className="mcp-h1">
                Ask us anything{" "}
                <span className="mc-serif">you would ask the data.</span>
              </h1>
              <p className="mcp-lede">
                Questions about coverage, a partnership idea, or press — send a note and it reaches
                the people who actually build the thing. We answer in full sentences, with the
                reasoning attached.
              </p>

              <ol className="mcp-channels">
                {CHANNELS.map((c) => (
                  <li key={c.h} className="mcp-channel">
                    <span className="mcp-channel-n">{c.n}</span>
                    <span className="mcp-channel-b">
                      <b>{c.h}</b>
                      <span>{c.p}</span>
                    </span>
                    <span className="mcp-channel-d">{c.d}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mc-rev" data-delay="140">
              <ContactForm />
            </div>
          </div>
        </section>

        {/* ── What happens next ─────────────────────────────────────── */}
        <section className="mcp-sec">
          <div className="mcp-inner">
            <div className="mcp-sec-head mc-rev mc-rev-sm">
              <span className="mcp-sec-n">After you send</span>
              <h2 className="mcp-h2">What happens to your note</h2>
              <span className="mcp-rule" />
            </div>
            <div className="mcp-cards mc-rev mc-rev-sm">
              {EXPECT.map((e) => (
                <article key={e.h} className="mcp-card">
                  <h3>{e.h}</h3>
                  <p>{e.p}</p>
                </article>
              ))}
            </div>
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
            Or just <span className="mc-serif">open it and look.</span>
          </h2>
          <p className="mc-rev mc-rev-sm">
            Most questions about the platform are answered faster by the platform. The terminal is
            open — the FAQs cover the rest.
          </p>
          <div className="mcp-actions mc-rev mc-rev-sm">
            <a className="mcp-cta" href={APP_SIGNUP_URL}>
              Open the terminal <i>→</i>
            </a>
            <Link className="mcp-cta-ghost" href="/faqs">
              Read the FAQs
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
