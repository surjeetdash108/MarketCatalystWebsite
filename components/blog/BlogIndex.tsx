"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Post } from "@/lib/blog/posts";
import { PER_PAGE, SECTIONS, postsHref, sectionOfType, type Section } from "@/lib/blog/sections";
import { readerId } from "@/lib/blog/reader-id";
import { useDebounce } from "@/hooks/useDebounce";
import { buildMatcher, fold, normaliseQuery, testIn } from "@/lib/blog/search-match";
import { Marked } from "@/components/chrome/Marked";
import { SiteNav } from "@/components/chrome/SiteNav";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { useReaderTheme } from "@/components/chrome/useReaderTheme";
import { useEtClock, useReveal, useScrollChrome } from "@/components/chrome/chrome-hooks";

/* ── the three sections, in the design's own vocabulary ───────────────────── */

// The section list, the type -> section map, PER_PAGE and the listing URLs live
// in lib/blog/sections.ts: the server needs the same ones to render and
// canonicalise ?section= / ?page= views.
const TAG_CLASS: Record<Section, string> = {

  Recap: "mcb-tag-recap",

  "Analysis": "mcb-tag-desk",

  Educational: "mcb-tag-edu",

  News: "mcb-tag-news",

  Earnings: "mcb-tag-earnings",

};

function sectionOf(p: Pick<Post, "type">): Section {
  return sectionOfType(p.type);
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Dates and times render in New York, always — not in the reader's zone.
 *
 * Two reasons. This component renders on the server and again in the browser,
 * and a zone-dependent format produces different text in each, which React
 * reports as a hydration mismatch; a fixed zone gives both sides the same
 * string. And the posts are about the US session, so "16:05" means something
 * to a reader in London precisely because it is the closing bell and not their
 * own clock.
 */
const ET = "America/New_York";

const fmtLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: ET,
  });

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: ET,
  }) + " ET";

/** Sort key: published where it exists, created otherwise — a published post
 *  with no publishedAt must not fall to the bottom of the list. */
const when = (p: Pick<Post, "publishedAt" | "createdAt">) => p.publishedAt ?? p.createdAt;

/* ── Types ────────────────────────────────────────────────────────────── */

/**
 * What the board needs of a post, and nothing more. Every field here is
 * serialised into the page for EVERY post in the archive, so adding one is a
 * cost multiplied by the archive size (this type used to be the whole `Post`,
 * which is how the page reached 11 MB).
 */
export type IndexPost = Pick<
  Post,
  "id" | "slug" | "title" | "excerpt" | "type" | "author" | "editorsChoice" | "publishedAt" | "createdAt"
> & {
  /** Pre-computed on the server from the article body. */
  readMin?: number;
  heroPreview?: string;
};

/** A plain left-click we can handle in place; anything else (new tab, new window, download) is the browser's. */
function isPlainClick(e: React.MouseEvent): boolean {
  return !e.defaultPrevented && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

/** What /api/blog/search says about one matching post. */
type Hit = {
  /** A line of the article around the first occurrence, or "" if the query
   *  matched the headline/standfirst only. */
  quote: string;
  /** Occurrences in the body, for the "3 mentions in article" label. */
  hits: number;
};

/* ── Component ────────────────────────────────────────────────────────── */

export function BlogIndex({
  posts,
  reads = {},
  initialSection = "all",
  initialPage = 1,
}: {
  posts: IndexPost[];
  /** slug → times opened this week, from blog_stats. */
  reads?: Record<string, number>;
  /** The section and page the URL asked for (?section=, ?page=), so a crawler
   *  or a shared link lands on that view rather than on page 1. */
  initialSection?: Section | "all";
  initialPage?: number;
}) {
  const { theme, toggle: toggleTheme } = useReaderTheme();

  const [activeSec, setActiveSec] = useState<Section | "all">(initialSection);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(initialPage);
  const [view, setView] = useState<"list" | "grid">("list");
  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "sending" | "sent" | "error" | "failed">("idle");

  const rootRef = useRef<HTMLDivElement>(null);

  /* ── server-side search ────────────────────────────────────────────────
     Title and standfirst are already here, so those highlight on the very
     keystroke. The BODY is not — shipping every article to the index page
     to search it in the browser would cost more than the page itself — so
     the quoted line and the mention count come from the server, debounced. */
  // The query the rest of the page reasons about: folded, ellipsis-stripped
  // and capped. Everything keys off this rather than the raw field, so
  // "  support " and "support" are one search and one cache entry.
  const q = normaliseQuery(query);
  const rx = useMemo(() => buildMatcher(query), [query]);
  const debouncedQuery = useDebounce(q, 300);
  const [server, setServer] = useState<{ q: string; hits: Map<string, Hit> } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    // Nothing to clear when the box empties: `hitMap` below only trusts a
    // result whose query still matches, so a stale answer is already inert —
    // and keeping it means re-typing the same word answers instantly.
    if (!debouncedQuery) return;

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    (async () => {
      try {
        const res = await fetch(
          `/api/blog/search?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: ctrl.signal },
        );
        const data = await res.json();
        if (ctrl.signal.aborted || !data?.ok) return;
        const hits = new Map<string, Hit>();
        for (const r of data.results as { id: string; quote: string; hits: number }[]) {
          hits.set(r.id, { quote: r.quote, hits: r.hits });
        }
        setServer({ q: debouncedQuery, hits });
      } catch {
        /* aborted or offline — the previous results stand */
      }
    })();

    return () => ctrl.abort();
  }, [debouncedQuery]);

  /** The server's hits, but only while they are for the query currently in
   *  the box — a stale answer must never decide what is on screen. Null
   *  means "the browser is still on its own". */
  const hitMap = server && server.q === q ? server.hits : null;

  /** Derived, not stored: we are searching exactly while there is a query the
   *  server has not answered for yet. */
  const searching = !!q && !hitMap;

  /* ── this reader's history ────────────────────────────────────────────── */
  const track = useCallback((section: Section) => {
    const id = readerId();
    if (!id) return;
    void fetch("/api/blog/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ readerId: id, section }),
    }).catch(() => {
      /* the count is not worth a retry */
    });
  }, []);

  const chooseSection = (sec: Section | "all") => {
    setActiveSec(sec);
    setPage(1);
    if (sec !== "all") track(sec);
  };

  /**
   * Count the open. sendBeacon because the click is navigating away — a fetch
   * started here would usually be cancelled before it left the browser.
   */
  const countOpen = useCallback((p: IndexPost) => {
    const id = readerId();
    if (!id) return;
    const payload = JSON.stringify({ readerId: id, section: sectionOf(p), slug: p.slug });
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/blog/track", new Blob([payload], { type: "application/json" }));
        return;
      }
    } catch {
      /* fall through to fetch */
    }
    void fetch("/api/blog/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }, []);

  /* ── newest first, everywhere ───────────────────────────────────────────── */
  const sorted = useMemo(
    () => [...posts].sort((a, b) => when(b).localeCompare(when(a))),
    [posts],
  );

  /** What the browser can match against on its own: everything it already
   *  holds, folded once so a keystroke doesn't re-fold the whole archive. */
  const hays = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of sorted) m.set(p.id, fold(`${p.title} ${p.excerpt} ${sectionOf(p)}`));
    return m;
  }, [sorted]);

  /** Totals beside each pill — of the archive, not of the current search. */
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: sorted.length };
    for (const sec of SECTIONS) c[sec] = sorted.filter((p) => sectionOf(p) === sec).length;
    return c;
  }, [sorted]);

  /** The admin's Editor's choice. `sorted` holds only published posts, so a
   *  flagged draft never surfaces; should more than one published post carry
   *  the flag, the newest wins (`sorted` is newest-first). */
  const choice = useMemo(() => sorted.find((p) => p.editorsChoice) ?? null, [sorted]);

  /**
   * The featured slot: the admin's Editor's choice whenever it belongs to the
   * section in view, otherwise the most-read post of that section.
   *
   * With nothing read yet the newest stands in, so the slot is never empty on
   * a quiet week — `sorted` is already newest-first, so the fallback needs no
   * second sort.
   */
  const pick = useMemo(() => {
    const pool = activeSec === "all" ? sorted : sorted.filter((p) => sectionOf(p) === activeSec);
    if (pool.length === 0) return null;
    if (choice && pool.includes(choice)) return choice;
    return [...pool].sort((a, b) => (reads[b.slug] ?? 0) - (reads[a.slug] ?? 0))[0];
  }, [sorted, activeSec, reads, choice]);
  const pickIsChoice = !!pick && pick === choice;

  /* ── section + search, applied together ───────────────────────────────── */
  const filtered = useMemo(
    () =>
      sorted.filter((p) => {
        if (activeSec !== "all" && sectionOf(p) !== activeSec) return false;
        if (!rx) return true;
        // Once the server has answered for THIS query, its answer is the
        // truth — it is the only side that has read the article bodies.
        if (hitMap) return hitMap.has(p.id);
        // Until then, match on what the browser already holds. Same phrase
        // rule, so nothing that is showing will jump out from under the
        // reader when the fuller result lands.
        return testIn(hays.get(p.id) ?? "", rx);
      }),
    [sorted, activeSec, rx, hitMap, hays],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // A filter can strand the reader past the end of the new result set.
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  /** No pick while a search is running. It is a curated card, not a result:
   *  leaving it up puts an unhighlighted article above the matches, and it
   *  would pop in and out as the server's fuller answer replaced the
   *  browser's first guess. During a search the page shows matches only. */
  const showPick = !!pick && !q;

  /**
   * Most read this week, when anything has been read.
   *
   * Ranked by real opens, falling back to newest only while the week has no
   * data, so the box is never empty on a Monday morning. Filtered by the
   * query too, so a search empties it rather than leaving four stale links
   * highlighted with nothing.
   */
  const mostRead = useMemo(() => {
    const hasReads = Object.keys(reads).length > 0;
    const base = hasReads
      ? [...sorted].filter((p) => reads[p.slug]).sort((a, b) => (reads[b.slug] ?? 0) - (reads[a.slug] ?? 0))
      : sorted;
    return base.filter((p) => !rx || testIn(fold(p.title), rx)).slice(0, 4);
  }, [sorted, reads, rx]);

  const href = (p: IndexPost) => `/posts/${encodeURIComponent(p.slug)}`;

  /* ── pager and section pills are links ─────────────────────────────────
     They used to be <button>s with no href, so a crawler saw no way past page
     1 or into a section and 148 posts were reachable only from the sitemap.
     Each is now an <a> to its own URL (see postsHref); a plain click is still
     handled in place, so the board does not reload. The address bar follows
     with replaceState, and only while there is no search running (the URL
     names a listing view, not a query). It is skipped on the first run so the
     landing URL, with whatever campaign parameters it carried, is left alone. */
  const goTo = (e: React.MouseEvent, sec: Section | "all", n: number) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    if (sec !== activeSec) chooseSection(sec);
    setPage(n);
  };
  const urlSynced = useRef(false);
  useEffect(() => {
    if (!urlSynced.current) {
      urlSynced.current = true;
      return;
    }
    if (q) return;
    const target = postsHref(activeSec, current);
    if (window.location.pathname + window.location.search !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [activeSec, current, q]);

  /* ── newsletter ────────────────────────────────────────────────────────
     Saves the address server-side (POST /api/newsletter → Firestore). It used
     to open a mailto: link, which did nothing for anyone without a desktop
     mail app while the button still said "Request sent". "Sent" now shows
     only once the server has stored the address. */
  const sendRecap = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setSubState("error");
      return;
    }
    if (subState === "sending") return;
    setSubState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "posts" }),
      });
      setSubState(res.ok ? "sent" : res.status === 400 ? "error" : "failed");
    } catch {
      setSubState("failed");
    }
  };

  /* ── shared chrome behaviour ───────────────────────────────────────────
     The board keeps its own reveal call because its cards arrive and leave as
     the reader filters, searches and pages — the hook re-observes on every
     render for exactly that reason. */
  useScrollChrome();
  useEtClock();
  useReveal(rootRef);

  /* ── render ───────────────────────────────────────────────────────────── */

  const searchIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.6-3.6" />
    </svg>
  );

  return (
    <div className="mc-page" data-theme={theme} ref={rootRef}>
      <div className="mc-prog">
        <i id="mc-prog-bar" />
      </div>

      <SiteNav active="blogs" theme={theme} onToggleTheme={toggleTheme} />

      {/* ── Masthead + controls ─────────────────────────────────────── */}
      <section className="mcb-head">
        <div className="mcb-inner">
          <h1 className="mcb-h1 mc-rev">
            Daily recaps, research and guides to how the market{" "}
            <span className="mc-serif">actually works.</span>
          </h1>

          <div className="mcb-filters mc-rev mc-rev-sm" data-delay="140">
            <a
              className="mcb-pill"
              href={postsHref("all", 1)}
              aria-current={activeSec === "all" ? "true" : undefined}
              onClick={(e) => goTo(e, "all", 1)}
            >
              All posts <b>{counts.all}</b>
            </a>
            {SECTIONS.map((sec) => (
              <a
                key={sec}
                className="mcb-pill"
                href={postsHref(sec, 1)}
                aria-current={activeSec === sec ? "true" : undefined}
                onClick={(e) => goTo(e, sec, 1)}
              >
                {sec} <b>{counts[sec]}</b>
              </a>
            ))}

            <div className="mcb-search">
              {searchIcon}
              {/* type="text", not "search": a search field draws its own
                  clear button, which cannot be themed and sat next to ours —
                  two crosses in one box. Escape still clears, as it would
                  have there. */}
              <input
                type="text"
                role="searchbox"
                enterKeyHint="search"
                placeholder="Search posts, tickers, themes…"
                aria-label="Search posts"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape" && query) {
                    e.preventDefault();
                    setQuery("");
                  }
                }}
              />
              {query.length > 0 && (
                <button type="button" className="mcb-clear" aria-label="Clear search" onClick={() => setQuery("")}>
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Editor's pick ───────────────────────────────────────────── */}
      {showPick && pick && (
        <section className="mcb-pick-sec">
          <div className="mcb-inner">
            <div className="mcb-sec-row">
              {/* "Choice" only when a person chose it; the automatic
                  most-read fallback keeps its original label. */}
              <h2 className="mcb-kicker">{pickIsChoice ? "Editor’s choice" : "Editor’s pick"}</h2>
              <span className="mcb-rule" />
            </div>

            <a className="mcb-pick mc-rev" href={href(pick)} onClick={() => countOpen(pick)}>
              <span className={`mcb-tag mcb-tag-solid ${TAG_CLASS[sectionOf(pick)]}`}>
                {sectionOf(pick)}
              </span>
              <h3 className="mcb-pick-h">
                <Marked text={pick.title} rx={rx} />
              </h3>
              <p className="mcb-pick-p">
                <Marked text={pick.heroPreview || pick.excerpt} rx={rx} />
              </p>
              <div className="mcb-by">
                <span className="mcb-avatar">{initials(pick.author || "Desk")}</span>
                <span className="mcb-author">{pick.author || "Desk"}</span>
                <span className="mcb-meta">
                  {fmtLong(when(pick))} · {fmtTime(when(pick))}
                </span>
                <span className="mcb-meta">{pick.readMin ?? 1} min read</span>
                <span className="mcb-read">Read →</span>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* ── Latest posts + rail ─────────────────────────────────────── */}
      <section className="mcb-latest">
        <div className="mcb-cols">
          <div className="mcb-main">
            <div className="mcb-sec-row">
              <h2 className="mcb-kicker">
                {q ? `Search results${searching ? "…" : ""}` : "Latest posts"}
              </h2>
              <span className="mcb-rule" />
              <div className="mcb-tools">
                <nav className="mcb-pager" aria-label="Pagination">
                  {current <= 1 ? (
                    <span className="mcb-pgbtn" aria-disabled="true" aria-label="Previous page">
                      ‹
                    </span>
                  ) : (
                    <a
                      className="mcb-pgbtn"
                      href={postsHref(activeSec, current - 1)}
                      rel="prev"
                      aria-label="Previous page"
                      onClick={(e) => goTo(e, activeSec, current - 1)}
                    >
                      ‹
                    </a>
                  )}
                  {pageNumbers(current, pages).map((n, i) =>
                    n === "…" ? (
                      <span className="mcb-gap" key={`gap${i}`}>
                        …
                      </span>
                    ) : (
                      <a
                        key={n}
                        className="mcb-pgbtn"
                        href={postsHref(activeSec, n)}
                        onClick={(e) => goTo(e, activeSec, n)}
                        aria-current={n === current ? "page" : undefined}
                        aria-label={`Page ${n}`}
                      >
                        {n}
                      </a>
                    ),
                  )}
                  {current >= pages ? (
                    <span className="mcb-pgbtn" aria-disabled="true" aria-label="Next page">
                      ›
                    </span>
                  ) : (
                    <a
                      className="mcb-pgbtn"
                      href={postsHref(activeSec, current + 1)}
                      rel="next"
                      aria-label="Next page"
                      onClick={(e) => goTo(e, activeSec, current + 1)}
                    >
                      ›
                    </a>
                  )}
                </nav>
                <div className="mcb-views" role="group" aria-label="Layout">
                  <button
                    type="button"
                    className="mcb-view"
                    aria-pressed={view === "list"}
                    aria-label="List view"
                    onClick={() => setView("list")}
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                      <path d="M2 4h12M2 8h12M2 12h12" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="mcb-view"
                    aria-pressed={view === "grid"}
                    aria-label="Grid view"
                    onClick={() => setView("grid")}
                  >
                    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <rect x="1.75" y="1.75" width="5.4" height="5.4" rx="1.4" />
                      <rect x="8.85" y="1.75" width="5.4" height="5.4" rx="1.4" />
                      <rect x="1.75" y="8.85" width="5.4" height="5.4" rx="1.4" />
                      <rect x="8.85" y="8.85" width="5.4" height="5.4" rx="1.4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {shown.length === 0 ? (
              <div className="mcb-empty">
                <div className="mcb-empty-k">{q ? "No results" : "Nothing here yet"}</div>
                <p>
                  {q
                    ? "Nothing matches that search yet. Try a ticker, a topic, or clear the filters."
                    : "No posts in this section yet. Try another one."}
                </p>
                {q && (
                  <button type="button" onClick={() => setQuery("")}>
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className={`mcb-feed${view === "grid" ? " is-grid" : ""}`}>
                {shown.map((p) => {
                  const hit = hitMap?.get(p.id);
                  const quote = hit?.quote ?? "";
                  const n = hit?.hits ?? 0;
                  return (
                    <a
                      className="mcb-post mc-rev mc-rev-sm"
                      key={p.id}
                      href={href(p)}
                      onClick={() => countOpen(p)}
                    >
                      <div className="mcb-post-body">
                        <span className={`mcb-tag ${TAG_CLASS[sectionOf(p)]}`}>{sectionOf(p)}</span>
                        {p === choice && <span className="mcb-tag mcb-tag-ec">★ Editor&rsquo;s choice</span>}
                        <h3 className="mcb-post-h">
                          <Marked text={p.title} rx={rx} />
                        </h3>
                        <p className="mcb-post-p">
                          <Marked text={p.excerpt} rx={rx} />
                        </p>

                        {/* Shown only when the match is INSIDE the article —
                            otherwise the card would quote its own headline
                            back at the reader. */}
                        {quote && (
                          <div className="mcb-quote">
                            <span className="mcb-quote-l">
                              {searchIcon}
                              {n > 1 ? `${n} mentions in article` : "in article"}
                            </span>
                            <span className="mcb-quote-t">
                              <Marked text={quote} rx={rx} />
                            </span>
                          </div>
                        )}

                        <div className="mcb-by">
                          <span className="mcb-avatar">{initials(p.author || "Desk")}</span>
                          <span className="mcb-author">{p.author || "Desk"}</span>
                          <span className="mcb-meta">
                            {fmtLong(when(p))} · {fmtTime(when(p))}
                          </span>
                          <span className="mcb-meta">{p.readMin ?? 1} min read</span>
                        </div>
                      </div>
                      <span className="mcb-arrow">→</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="mcb-rail">
            {mostRead.length > 0 && (
              <div className="mcb-box">
                <div className="mcb-box-h">Most read this week</div>
                {mostRead.map((p, i) => (
                  <Link className="mcb-most" key={p.id} href={href(p)} onClick={() => countOpen(p)}>
                    <span className="mcb-most-n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="mcb-most-t">
                      <Marked text={p.title} rx={rx} />
                    </span>
                  </Link>
                ))}
              </div>
            )}

            <div className="mcb-sub">
              <div className="mcb-sub-k">
                <i />
                <span>The daily recap</span>
              </div>
              <h3>One email after the US close</h3>
              <p>Indices, movers, and the reason behind each.</p>
              <input
                type="email"
                className={subState === "error" || subState === "failed" ? "is-bad" : undefined}
                placeholder="you@firm.com"
                aria-label="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSubState("idle");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void sendRecap();
                  }
                }}
              />
              <button type="button" onClick={() => void sendRecap()} disabled={subState === "sending"}>
                {subState === "sent" ? "You're on the list ✓" : subState === "sending" ? "Signing you up…" : "Get the recap"}
              </button>
              <p className={`mcb-note${subState === "sent" ? " is-ok" : subState === "error" || subState === "failed" ? " is-bad" : ""}`}>
                {subState === "error"
                  ? "Enter a valid email address."
                  : subState === "failed"
                    ? "Couldn't sign you up just now — please try again in a minute."
                    : subState === "sent"
                      ? "Thanks — you're subscribed to the daily recap."
                      : "Free. Unsubscribe anytime."}
              </p>
            </div>

            <div className="mcb-plug">
              <div className="mcb-plug-h">From the terminal</div>
              <p>
                Every post here is written over the same record that powers the fourteen research
                workspaces.
              </p>
              <Link href="/#workspaces">See what&rsquo;s inside →</Link>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

/**
 * Page numbers with the middle elided, so a long archive does not push the
 * view switch off the row. Always shows the first and last page, the current
 * one, and its neighbours.
 */
function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const from = Math.max(2, current - 1);
  const to = Math.min(total - 1, current + 1);
  if (from > 2) out.push("…");
  for (let n = from; n <= to; n++) out.push(n);
  if (to < total - 1) out.push("…");
  out.push(total);
  return out;
}
