"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Post } from "@/lib/blog/posts";
import { readerId } from "@/lib/blog/reader-id";
import { APP_SIGNUP_URL } from "@/components/marketing/app-url";
import { useDebounce } from "@/hooks/useDebounce";

/* ── the three sections, in the template's own vocabulary ─────────────────── */

type Section = "Recap" | "Research desk" | "Educational";
const SECTIONS: Section[] = ["Recap", "Research desk", "Educational"];

/** Post.type is the stored zone; the template names them differently. */
const SECTION_OF: Record<string, Section> = {
  recap: "Recap",
  research: "Research desk",
  educational: "Educational",
};
const SEC_CLASS: Record<Section, string> = {
  Educational: "mc-edu",
  Recap: "mc-recap",
  "Research desk": "mc-desk",
};

const PER_PAGE = 6;

function sectionOf(p: Post): Section {
  return SECTION_OF[p.type] ?? "Educational";
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
const when = (p: Post) => p.publishedAt ?? p.createdAt;

/**
 * A cover image, or a labelled gap where one should be.
 *
 * Drawn rather than hidden: leaving the box out would change the shape of the
 * row for that one post, and an <img> pointed at nothing renders as a broken
 * icon. Saying so is more useful to whoever has to go and add the art.
 */
/**
 * A post's cover art, or NOTHING at all.
 *
 * The hero image is optional on the way in, so a post without one is a normal
 * post rather than a broken one. It used to draw a bordered "Image not
 * available" box, which read as a failure on a board where half the posts may
 * legitimately carry no art. Now the thumbnail is simply absent, and the card
 * closes the gap it left (see .mc-nothumb in blog-index.css).
 */
function Cover({ src, className, eager }: { src: string | null; className: string; eager?: boolean }) {
  if (!src) return null;
  return (
    <div className={className}>
      {/* Plain <img>, not next/image: covers come from two different Storage
          hosts and an unconfigured one makes next/image throw rather than
          degrade — on an index page that would take the whole board down. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" loading={eager ? "eager" : "lazy"} />
    </div>
  );
}

/** Extended post type with server-pre-computed display values. */
export type IndexPost = Post & {
  readMin?: number;
  heroPreview?: string;
};

export function BlogIndex({
  posts,
  reads = {},
}: {
  posts: IndexPost[];
  /** slug → times opened this week, from blog_stats. */
  reads?: Record<string, number>;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeSec, setActiveSec] = useState<Section | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "grid">("list");

  /* ── server-side search ──────────────────────────────────────────────── */
  const debouncedQuery = useDebounce(query.trim(), 300);
  const [serverSearch, setServerSearch] = useState<{ q: string; ids: Set<string> } | null>(null);
  const [searching, setSearching] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Abort any in-flight request.
    abortRef.current?.abort();

    if (!debouncedQuery || debouncedQuery.length < 2) {
      setServerSearch(null);
      setSearching(false);
      return;
    }

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSearching(true);

    (async () => {
      try {
        const res = await fetch(
          `/api/blog/search?q=${encodeURIComponent(debouncedQuery)}`,
          { signal: ctrl.signal },
        );
        const data = await res.json();
        if (!ctrl.signal.aborted && data?.ok) {
          setServerSearch({ q: debouncedQuery.toLowerCase(), ids: new Set(data.ids as string[]) });
          setPage(1);
        }
      } catch {
        /* aborted or offline — the previous results stand */
      } finally {
        if (!ctrl.signal.aborted) setSearching(false);
      }
    })();

    return () => ctrl.abort();
  }, [debouncedQuery]);

  /** Whether a content search is active (Highlights should be hidden). */
  const isSearching = debouncedQuery.length >= 2;

  /* ── theme, remembered ──────────────────────────────────────────────────
     The template kept this in memory only and left a note to persist it. */
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("mc-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(saved === "dark" || saved === "light" ? saved : prefersDark ? "dark" : "light");
    } catch {
      /* storage disabled — the default stands */
    }
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      window.localStorage.setItem("mc-theme", next);
    } catch {
      /* nothing to do */
    }
  };

  /* ── this reader's history ──────────────────────────────────────────────
     Read once on mount, and written each time a section is opened. Failure is
     silent by design: a history is a convenience, and losing it must never
     cost the reader the page. */
  useEffect(() => {
    const id = readerId();
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/blog/track?readerId=${encodeURIComponent(id)}`);
        const data = await res.json();
        if (cancelled || !data?.ok) return;
        // The board opens on All posts, always. It used to restore the last
        // section browsed, which meant a returning reader landed in Recap and
        // saw a filtered board they had not asked for — and could not tell it
        // was filtered without noticing the pill.
      } catch {
        /* offline, or the endpoint is unavailable */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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

  /* ── newest first, everywhere ───────────────────────────────────────────── */
  const sorted = useMemo(
    () => [...posts].sort((a, b) => when(b).localeCompare(when(a))),
    [posts],
  );

  /**
   * Highlights: the newest post from each of the three sections.
   *
   * Not "the three newest posts" — that can be three recaps on a busy week,
   * and the point of this row is that a reader sees one of each. The lead card
   * is whichever of those three is newest.
   */
  const highlights = useMemo(() => {
    const pool = activeSec === "all" ? sorted : sorted.filter((p) => sectionOf(p) === activeSec);
    if (pool.length === 0) return [];
    // Most read wins; with nothing read yet the newest stands in, so the slot
    // is never empty on a quiet week. `sorted` is already newest-first, so the
    // fallback needs no second sort.
    const best = [...pool].sort((a, b) => (reads[b.slug] ?? 0) - (reads[a.slug] ?? 0))[0];
    return [best];
  }, [sorted, activeSec, reads]);

  /* ── section + search, applied together ─────────────────────────────────
     When a search is active (searchIds is non-null), the server has returned
     the IDs of matching posts. The client filters its existing list by those
     IDs — no content re-transmitted. For quick title/excerpt matches while
     the user is still typing (before debounce fires), we do a lightweight
     client-side pre-filter on title + excerpt only. */
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      sorted.filter((p) => {
        if (activeSec !== "all" && sectionOf(p) !== activeSec) return false;
        if (!q) return true;
        // If server results are available for THIS query, use them.
        if (serverSearch && serverSearch.q === q) return serverSearch.ids.has(p.id);
        // While waiting for the debounced server response, do a quick
        // client-side check on title + excerpt (lightweight, no content).
        return `${p.title} ${p.excerpt} ${sectionOf(p)}`.toLowerCase().includes(q);
      }),
    [sorted, activeSec, q, serverSearch],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // A filter can strand the reader past the end of the new result set.
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  /**
   * Most read this week, when anything has been read.
   *
   * This was `sorted.slice(0, 4)` — the four NEWEST posts under a heading that
   * said "most read", which is a claim the page could not support. It now ranks
   * by real opens and falls back to newest only while the week has no data, so
   * the box is never empty on a Monday morning.
   */
  const hasReads = Object.keys(reads).length > 0;
  const mostRead = useMemo(() => {
    if (!hasReads) return sorted.slice(0, 4);
    return [...sorted]
      .filter((p) => reads[p.slug])
      .sort((a, b) => (reads[b.slug] ?? 0) - (reads[a.slug] ?? 0))
      .slice(0, 4);
  }, [sorted, reads, hasReads]);

  const href = (p: Post) => `/posts/${encodeURIComponent(p.slug)}`;

  /**
   * Count the open. sendBeacon because the click is navigating away — a fetch
   * started here would usually be cancelled before it left the browser.
   */
  const countOpen = useCallback((p: Post) => {
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

  return (
    <div className="mcb2" data-theme={theme}>
      <header className="mc-top">
        <div className="mc-top-in">
          <a className="mc-brand" href="/">
            Market<span>Catalyst</span>
          </a>
          <nav className="mc-main">
            <a href="/about">About us</a>
            <a className="mc-active" href="/posts">Blogs</a>
            {/* FAQs only is left out here — it was the first item dropped on a
                narrow screen, so the nav changed shape between widths. The
                board's own footer still links to /faqs for anyone who wants it.
                About us has no such rule and carries through from the marketing
                nav (components/marketing/Nav.tsx) like the rest. */}
            <a href="/admin/login">Log in</a>
            <a className="mc-btn-grad" href={APP_SIGNUP_URL}>Sign up</a>
            <button
              id="themeBtn"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              <svg className="mc-sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
              <svg className="mc-moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M20 14.5A8.2 8.2 0 019.6 4 8.4 8.4 0 1020 14.5z" /></svg>
            </button>
          </nav>
        </div>
      </header>

      <div className="mc-wrap">
        <div className="mc-masthead">
          <p className="mc-stand">
            Daily recaps, single-stock research and guides to how the market actually works.
          </p>
        </div>

        <div className="mc-controls">
          <div className="mc-pills" role="group" aria-label="Filter posts by section">
            <button
              className="mc-pill"
              aria-pressed={activeSec === "all"}
              onClick={() => chooseSection("all")}
            >
              All posts
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                className="mc-pill"
                aria-pressed={activeSec === sec}
                onClick={() => chooseSection(sec)}
              >
                {sec}
              </button>
            ))}
          </div>
          <div className="mc-search">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.6-3.6" /></svg>
            <input
              id="q"
              type="search"
              placeholder="Search posts, tickers, themes"
              aria-label="Search posts"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {/* Hide Highlights when a search is active — only matched results
            should be on screen, not a curated hero card. */}
        {!isSearching && (
          <section id="highlights">
            <h2 className="mc-sec">Highlights</h2>
            <div className="mc-highlights">
              {highlights.length === 0 ? (
                <p className="mc-empty">Nothing published yet.</p>
              ) : (
                <>
                  <a
                    className={`mc-hero-card${highlights[0].coverImageUrl ? "" : " mc-nothumb"}`}
                    href={href(highlights[0])}
                    onClick={() => countOpen(highlights[0])}
                  >
                    <Cover src={highlights[0].coverImageUrl} className="mc-thumb" eager />
                    <div className="mc-body">
                      <span className={`mc-tag ${SEC_CLASS[sectionOf(highlights[0])]}`}>
                        {sectionOf(highlights[0])}
                      </span>
                      <h3>{highlights[0].title}</h3>
                      <p>{(highlights[0] as IndexPost).heroPreview || highlights[0].excerpt}</p>
                      <div className="mc-byline">
                        <span className="mc-avatar">{initials(highlights[0].author || "Desk")}</span>
                        {highlights[0].author || "Desk"}
                        <span className="mc-sep" />
                        {fmtLong(when(highlights[0]))} · {fmtTime(when(highlights[0]))}
                        <span className="mc-sep" />
                        {(highlights[0] as IndexPost).readMin ?? 1} min read
                      </div>
                    </div>
                  </a>
                </>
              )}
            </div>
          </section>
        )}

        <section style={{ paddingTop: 10 }}>
          <div className="mc-cols">
            <div>
              {/* Heading, pagination and the view switch share one line. */}
              <div className="mc-sec-row">
                <h2 className="mc-sec">{isSearching ? `Search results${searching ? "…" : ""}` : "Latest posts"}</h2>
                <div className="mc-sec-tools">
                  <nav className="mc-pager" aria-label="Pagination">
                    <button
                      type="button"
                      onClick={() => setPage(current - 1)}
                      disabled={current <= 1}
                      aria-label="Previous page"
                    >
                      ‹
                    </button>
                    {pageNumbers(current, pages).map((n, i) =>
                      n === "…" ? (
                        <span className="mc-gap" key={`gap${i}`}>
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          aria-current={n === current ? "page" : undefined}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => setPage(current + 1)}
                      disabled={current >= pages}
                      aria-label="Next page"
                    >
                      ›
                    </button>
                  </nav>
                  <div className="mc-viewsw" role="group" aria-label="Layout">
                    <button
                      type="button"
                      aria-pressed={view === "list"}
                      aria-label="List view"
                      onClick={() => setView("list")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="3" rx="1" /><rect x="1" y="6.5" width="14" height="3" rx="1" /><rect x="1" y="11" width="14" height="3" rx="1" /></svg>
                    </button>
                    <button
                      type="button"
                      aria-pressed={view === "grid"}
                      aria-label="Grid view"
                      onClick={() => setView("grid")}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="1" width="6" height="6" rx="1.2" /><rect x="9" y="1" width="6" height="6" rx="1.2" /><rect x="1" y="9" width="6" height="6" rx="1.2" /><rect x="9" y="9" width="6" height="6" rx="1.2" /></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className={`mc-feed mc-${view}`} id="feed">
                {shown.length === 0 ? (
                  <p className="mc-empty">{isSearching ? "No posts match your search." : "No posts match that filter yet."}</p>
                ) : (
                  shown.map((p) => {
                    const ip = p as IndexPost;
                    const d = new Date(when(p));
                    return (
                      <a
                        className={`mc-post${p.coverImageUrl ? "" : " mc-nothumb"}`}
                        key={p.id}
                        href={href(p)}
                        onClick={() => countOpen(p)}
                      >
                        <div className="mc-p-when">
                          <b>{d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: ET })}</b>
                          {d.toLocaleDateString("en-GB", { year: "numeric", timeZone: ET })}
                          <span className="mc-p-time">{fmtTime(when(p))}</span>
                        </div>
                        <div>
                          <span className={`mc-tag ${SEC_CLASS[sectionOf(p)]}`}>{sectionOf(p)}</span>
                          <h3 className="mc-p-title">{p.title}</h3>
                          <p className="mc-p-dek">{p.excerpt}</p>
                          <div className="mc-byline">
                            <span className="mc-avatar">{initials(p.author || "Desk")}</span>
                            {p.author || "Desk"}
                            <span className="mc-sep" />
                            {ip.readMin ?? 1} min read
                          </div>
                        </div>
                        <Cover src={p.coverImageUrl} className="mc-p-thumb" />
                      </a>
                    );
                  })
                )}
              </div>
            </div>

            <aside className="mc-rail">
              <div className="mc-rail-box">
                <h4>Most read this week</h4>
                <ul className="mc-rail-list">
                  {mostRead.map((p, i) => (
                    <li key={p.id}>
                      <a href={href(p)} onClick={() => countOpen(p)}>
                        <span className="mc-n">{String(i + 1).padStart(2, "0")}</span>
                        {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mc-rail-box mc-sub">
                <h4>The daily recap</h4>
                <p>One email after the US close. Indices, movers, and the reason behind each.</p>
                <input type="email" placeholder="you@work.com" aria-label="Email address" />
                <button type="button" disabled title="Not wired up yet">
                  Get the recap
                </button>
                <p className="mc-note">Free. Unsubscribe anytime.</p>
              </div>
            </aside>
          </div>
        </section>

        <footer className="mc-site">
          <div className="mc-fnav">
            <a href="/posts">Blogs</a>
            <a href="/faqs">FAQs</a>
            <a href="/admin/login">Log in</a>
            <a href={APP_SIGNUP_URL}>Sign up</a>
          </div>
          <p>
            MarketCatalyst publishes for information only. Nothing here is investment advice or a
            recommendation to buy or sell any security.
          </p>
        </footer>
      </div>
    </div>
  );
}

const SECTION_BLURB: Record<Section, string> = {
  Recap: "every close, every day",
  "Research desk": "company and theme work",
  Educational: "how the plumbing works",
};

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
