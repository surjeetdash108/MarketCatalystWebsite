"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Faq } from "@/lib/faq/faqs";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { Marked } from "@/components/chrome/Marked";
import { MarketChart } from "@/components/chrome/MarketChart";
import { buildMatcher, fold, testIn } from "@/lib/blog/search-match";

/**
 * The public FAQ board.
 *
 * Search works the way the blog's does — same matcher, same highlight — so a
 * reader who has used one already knows this one. Everything is held in
 * memory: the whole FAQ set arrives with the page, so filtering is instant and
 * there is no endpoint to call.
 *
 * The accordion is native <details>/<summary> sharing one `name`, which makes
 * it exclusive (opening one closes the rest) with no JavaScript and no ARIA to
 * get wrong. A search match opens its item automatically, since a closed row
 * would hide the very words that matched.
 */
export function FaqBoard({ faqs }: { faqs: Faq[] }) {
  const [query, setQuery] = useState("");

  const rx = useMemo(() => buildMatcher(query), [query]);

  /** Folded once per FAQ rather than per keystroke. */
  const hays = useMemo(() => {
    const m = new Map<string, string>();
    for (const f of faqs) m.set(f.id, fold(`${f.question} ${f.answer}`));
    return m;
  }, [faqs]);

  const shown = useMemo(
    () => (rx ? faqs.filter((f) => testIn(hays.get(f.id) ?? "", rx)) : faqs),
    [faqs, rx, hays],
  );

  const searchIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  );

  return (
    <main>
      {/* ── Masthead ──────────────────────────────────────────────── */}
      <section className="mcp-hero">
        <div className="mcp-glow" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>

        <div className="mcp-inner mcp-hero-grid">
          <div>
          <div className="mc-rev">
            <div className="mcp-kicker">
              <i />
              <span>Support</span>
            </div>
            <h1 className="mcp-h1">
              Questions, <span className="mc-serif">answered.</span>
            </h1>
            <p className="mcp-lede">
              Everything about the MarketCatalyst terminal — where its data comes from, what the
              platform will and will not do, and how the reads are produced. Open a question, or
              search the lot.
            </p>
          </div>

          <div className="mc-rev mc-rev-sm" data-delay="120">
            <div className="mcp-search">
              {searchIcon}
              {/* type="text", not "search": a search field draws its own clear
                  button, which cannot be themed and would sit next to ours. */}
              <input
                type="text"
                role="searchbox"
                enterKeyHint="search"
                placeholder="Search questions and answers…"
                aria-label="Search the FAQs"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && query) {
                    e.preventDefault();
                    setQuery("");
                  }
                }}
              />
              {query.length > 0 && (
                <button type="button" className="mcp-clear" aria-label="Clear search" onClick={() => setQuery("")}>
                  ×
                </button>
              )}
            </div>
            <div className="mcp-count">
              {rx
                ? `${shown.length} of ${faqs.length} ${faqs.length === 1 ? "question" : "questions"}`
                : `${faqs.length} ${faqs.length === 1 ? "question" : "questions"}`}
            </div>
          </div>
          </div>

          {/* The same picture the About page argues over, captioned for this
              one: most questions below are really "where does this number
              come from", and the answer is on the chart. */}
          <div className="mc-rev" data-delay="180">
            <MarketChart
              label="COVERAGE · 1D"
              read="Every figure on this screen carries the provider that produced it — which is what most of the questions below are really asking."
            />
          </div>
        </div>
      </section>

      {/* ── The list ──────────────────────────────────────────────── */}
      <section className="mcp-sec">
        <div className="mcp-cols">
          <div className="mcp-main">
            {faqs.length === 0 ? (
              <div className="mcp-card">
                <h3>Nothing here yet</h3>
                <p>
                  The FAQ is written alongside the platform. While it fills up, anything you need is
                  a message away.
                </p>
              </div>
            ) : shown.length === 0 ? (
              <div className="mcp-card">
                <h3>No question matches that</h3>
                <p>
                  Try a shorter phrase — or ask us directly and the answer will end up on this page
                  for the next person.
                </p>
                <div className="mcp-actions">
                  <button type="button" className="mcp-cta-ghost" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                  <Link className="mcp-cta-ghost" href="/contact">
                    Ask us <i>→</i>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mcp-faqs">
                {shown.map((faq, i) => (
                  <details
                    key={faq.id}
                    /* Exclusive accordion while browsing — but NOT while
                       searching: `name` makes the browser close every open row
                       but the last, and a hit has to be visible or the reader
                       is looking at a highlight they cannot see. */
                    name={rx ? undefined : "mcp-faq"}
                    open={!!rx}
                    className="mcp-faq mc-rev mc-rev-sm"
                  >
                    <summary className="mcp-faq-q">
                      <span className="mcp-faq-n">{String(i + 1).padStart(2, "0")}</span>
                      <span>
                        <Marked text={faq.question} rx={rx} />
                      </span>
                      <svg className="mcp-faq-chev" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </summary>
                    <div className="mcp-faq-a">
                      <Marked text={faq.answer} rx={rx} />
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>

          <aside className="mcp-rail">
            <div className="mcp-box">
              <div className="mcp-kicker">
                <i />
                <span>Still stuck</span>
              </div>
              <h3>Ask a person</h3>
              <p>
                Questions about the data, coverage, partnerships or press — we read every message and
                answer the ones we can.
              </p>
              <div className="mcp-actions">
                <Link className="mcp-cta" href="/contact">
                  Contact us <i>→</i>
                </Link>
              </div>
            </div>

            <div className="mcp-box mcp-box-plain">
              <div className="mcp-kicker" style={{ color: "var(--mc-text-muted)" }}>
                <span>From the terminal</span>
              </div>
              <p>
                Fourteen research workspaces over one normalised record — movers, earnings, analyst
                actions, insider flows and your own book.
              </p>
              <div className="mcp-actions">
                <a className="mcp-cta-ghost" href={APP_SIGNUP_URL}>
                  Open the terminal <i>→</i>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
