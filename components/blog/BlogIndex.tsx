"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Post } from "@/lib/blog/posts";
import { readerId } from "@/lib/blog/reader-id";

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
  Educational: "edu",
  Recap: "recap",
  "Research desk": "desk",
};

const PER_PAGE = 6;

function sectionOf(p: Post): Section {
  return SECTION_OF[p.type] ?? "Educational";
}

/** Words per minute is a convention, not a measurement — 200 is the usual one. */
function readMins(content: string): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.max(1, Math.round(words / 200));
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const fmtLong = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

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
function Cover({ src, className, eager }: { src: string | null; className: string; eager?: boolean }) {
  return (
    <div className={className}>
      {src ? (
        // Plain <img>, not next/image: covers come from two different Storage
        // hosts and an unconfigured one makes next/image throw rather than
        // degrade — on an index page that would take the whole board down.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading={eager ? "eager" : "lazy"} />
      ) : (
        <div className="noimg">Image not available</div>
      )}
    </div>
  );
}

export function BlogIndex({ posts }: { posts: Post[] }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeSec, setActiveSec] = useState<Section | "all">("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"list" | "grid">("list");
  /** This reader's own section counts, read back from Firestore. */
  const [mine, setMine] = useState<Record<string, number>>({});

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
        setMine(data.sections ?? {});
        // Open where they left off. Only when they have not already chosen —
        // a deliberate click must not be overwritten by a slow fetch.
        setActiveSec((cur) => (cur === "all" && data.lastSection ? data.lastSection : cur));
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
    setMine((m) => ({ ...m, [section]: (m[section] ?? 0) + 1 }));
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
    const picked = SECTIONS.map((sec) => sorted.find((p) => sectionOf(p) === sec)).filter(
      (p): p is Post => !!p,
    );
    return picked.sort((a, b) => when(b).localeCompare(when(a)));
  }, [sorted]);

  /* ── section + search, applied together ─────────────────────────────────
     The search runs inside the section on screen, which is what the pills
     mean: "Recap" plus a query reads as "recaps about that". */
  const q = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      sorted.filter((p) => {
        if (activeSec !== "all" && sectionOf(p) !== activeSec) return false;
        if (!q) return true;
        return `${p.title} ${p.excerpt} ${sectionOf(p)}`.toLowerCase().includes(q);
      }),
    [sorted, activeSec, q],
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // A filter can strand the reader past the end of the new result set.
  const current = Math.min(page, pages);
  const shown = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const mostRead = useMemo(() => sorted.slice(0, 4), [sorted]);

  const href = (p: Post) => `/posts/view?slug=${encodeURIComponent(p.slug)}`;

  return (
    <div className="mcb2" data-theme={theme}>
      <header className="top">
        <div className="top-in">
          <a className="brand" href="/">
            Market<span>Catalyst</span>
          </a>
          <nav className="main">
            <a className="active" href="/posts">Blogs</a>
            <a className="hide-sm" href="/faqs">FAQs</a>
            <a href="/admin/login">Log in</a>
            <a className="btn-grad" href="/contact">Sign up</a>
            <button
              id="themeBtn"
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            >
              <svg className="sun" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></svg>
              <svg className="moon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M20 14.5A8.2 8.2 0 019.6 4 8.4 8.4 0 1020 14.5z" /></svg>
            </button>
          </nav>
        </div>
      </header>

      <div className="wrap">
        <div className="masthead">
          <div className="eyebrow">MarketCatalyst blog</div>
          <h1>
            What moved, why it moved,
            <br />
            and what to do with it.
          </h1>
          <p className="stand">
            Daily recaps, single-stock research and guides to how the market actually works.
          </p>
        </div>

        <div className="controls">
          <div className="pills" role="group" aria-label="Filter posts by section">
            <button
              className="pill"
              aria-pressed={activeSec === "all"}
              onClick={() => chooseSection("all")}
            >
              All posts
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec}
                className="pill"
                aria-pressed={activeSec === sec}
                onClick={() => chooseSection(sec)}
              >
                {sec}
              </button>
            ))}
          </div>
          <div className="search">
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

        <section id="highlights">
          <h2 className="sec">Highlights</h2>
          <div className="highlights">
            {highlights.length === 0 ? (
              <p className="empty">Nothing published yet.</p>
            ) : (
              <>
                <a className="hero-card" href={href(highlights[0])}>
                  <Cover src={highlights[0].coverImageUrl} className="thumb" eager />
                  <div className="body">
                    <span className={`tag ${SEC_CLASS[sectionOf(highlights[0])]}`}>
                      {sectionOf(highlights[0])}
                    </span>
                    <h3>{highlights[0].title}</h3>
                    <p>{highlights[0].excerpt}</p>
                    <div className="byline">
                      <span className="avatar">{initials(highlights[0].author || "Desk")}</span>
                      {highlights[0].author || "Desk"}
                      <span className="sep" />
                      {fmtLong(when(highlights[0]))}
                      <span className="sep" />
                      {readMins(highlights[0].content)} min read
                    </div>
                  </div>
                </a>
                <div className="side-stack">
                  {highlights.slice(1).map((p) => (
                    <a className="mini" key={p.id} href={href(p)}>
                      <Cover src={p.coverImageUrl} className="mini-thumb" />
                      <span className={`tag ${SEC_CLASS[sectionOf(p)]}`}>{sectionOf(p)}</span>
                      <h3>{p.title}</h3>
                      <p>{p.excerpt}</p>
                      <div className="byline" style={{ marginTop: 12 }}>
                        {fmtLong(when(p))}
                        <span className="sep" />
                        {readMins(p.content)} min read
                      </div>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <section style={{ paddingTop: 10 }}>
          <div className="cols">
            <div>
              {/* Heading, pagination and the view switch share one line. */}
              <div className="sec-row">
                <h2 className="sec">Latest posts</h2>
                <div className="sec-tools">
                  <nav className="pager" aria-label="Pagination">
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
                        <span className="gap" key={`gap${i}`}>
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
                  <div className="viewsw" role="group" aria-label="Layout">
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

              <div className={`feed ${view}`} id="feed">
                {shown.length === 0 ? (
                  <p className="empty">No posts match that filter yet.</p>
                ) : (
                  shown.map((p) => {
                    const d = new Date(when(p));
                    return (
                      <a className="post" key={p.id} href={href(p)}>
                        <div className="p-when">
                          <b>{d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</b>
                          {d.getFullYear()}
                        </div>
                        <div>
                          <span className={`tag ${SEC_CLASS[sectionOf(p)]}`}>{sectionOf(p)}</span>
                          <h3 className="p-title">{p.title}</h3>
                          <p className="p-dek">{p.excerpt}</p>
                          <div className="byline">
                            <span className="avatar">{initials(p.author || "Desk")}</span>
                            {p.author || "Desk"}
                            <span className="sep" />
                            {readMins(p.content)} min read
                          </div>
                        </div>
                        <Cover src={p.coverImageUrl} className="p-thumb" />
                      </a>
                    );
                  })
                )}
              </div>
            </div>

            <aside className="rail">
              <div className="rail-box">
                <h4>Browse by section</h4>
                <ul className="rail-list">
                  {SECTIONS.map((sec, i) => (
                    <li key={sec}>
                      <a
                        href="#feed"
                        onClick={(e) => {
                          e.preventDefault();
                          chooseSection(sec);
                          document.getElementById("feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
                        }}
                      >
                        <span className="n">{String(i + 1).padStart(2, "0")}</span>
                        {sec} — {SECTION_BLURB[sec]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Read back from this reader's own record — see /api/blog/track. */}
              {Object.keys(mine).length > 0 && (
                <div className="rail-box">
                  <h4>Your sections</h4>
                  <div className="mine">
                    {SECTIONS.filter((s) => mine[s]).map((s) => (
                      <button key={s} type="button" onClick={() => chooseSection(s)}>
                        {s}
                        <span className="n">{mine[s]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="rail-box">
                <h4>Most read this week</h4>
                <ul className="rail-list">
                  {mostRead.map((p, i) => (
                    <li key={p.id}>
                      <a href={href(p)}>
                        <span className="n">{String(i + 1).padStart(2, "0")}</span>
                        {p.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rail-box sub">
                <h4>The daily recap</h4>
                <p>One email after the US close. Indices, movers, and the reason behind each.</p>
                <input type="email" placeholder="you@work.com" aria-label="Email address" />
                {/* Attachment control — appearance only for now. Nothing is
                    uploaded and nothing is sent; the send button is disabled so
                    the UI cannot imply otherwise. */}
                <div className="attach">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.4 11.05 12.25 20.2a5.5 5.5 0 0 1-7.78-7.78l9.2-9.2a3.67 3.67 0 1 1 5.18 5.18l-9.2 9.2a1.83 1.83 0 1 1-2.6-2.6l8.5-8.48" /></svg>
                  <span className="fname">No file attached</span>
                  <button type="button">Attach</button>
                </div>
                <button type="button" disabled title="Not wired up yet">
                  Get the recap
                </button>
                <p className="note">Free. Unsubscribe anytime.</p>
              </div>
            </aside>
          </div>
        </section>

        <footer className="site">
          <div className="fnav">
            <a href="/posts">Blogs</a>
            <a href="/faqs">FAQs</a>
            <a href="/admin/login">Log in</a>
            <a href="/contact">Sign up</a>
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
