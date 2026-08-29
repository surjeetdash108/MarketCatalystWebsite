"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Post } from "@/lib/blog/posts";
import { useBlogTheme } from "@/app/posts/theme-context";

/**
 * Public blog for /posts — the "MarketCatalyst blog" knowledge base. A left
 * sidebar (search + SECTIONS list with counts) filters the right content area
 * to the selected section; every card opens the full article
 * (/posts/view?slug=…) in a NEW TAB. Sections come from the post `type`
 * (educational | recap | research). Styling lives in app/posts/blog-board.css,
 * scoped under `.mcb`.
 */

type ZoneKey = "edu" | "recap" | "research";

const SECTIONS: { key: ZoneKey; title: string; accent: string }[] = [
  { key: "edu", title: "Educational", accent: "var(--edu)" },
  { key: "recap", title: "Recap", accent: "var(--recap)" },
  { key: "research", title: "Research desk", accent: "var(--research)" },
];

/** Map a post to its section by the explicit `type` field (source of truth). */
function zoneOf(post: Post): ZoneKey {
  switch (post.type) {
    case "recap":
      return "recap";
    case "research":
      return "research";
    case "educational":
    default:
      return "edu";
  }
}

function readMinutes(content: string): number {
  const words = content.replace(/<[^>]*>/g, " ").replace(/[#>*_`~[\]()!-]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

function shortDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function viewHref(post: Post): string {
  return `/posts/view?slug=${encodeURIComponent(post.slug)}`;
}

/** Footer label — the post's own kicker where it has one, else its section. */
function footLabel(post: Post): string {
  return post.categories[0] ?? SECTIONS.find((s) => s.key === zoneOf(post))?.title ?? "";
}

/** How the board draws its posts. Both are cards; they differ in whether the
 *  image sits above the text or beside it. */
type View = "list" | "grid";

/**
 * One post as a card.
 *
 * The board used to list posts as stacked text rows, which left a hero image
 * nowhere to appear — cover art never reached the reader until they opened the
 * post. Leading with the image makes the board scannable by sight and not only
 * by headline.
 *
 * ONE markup for both views: list and grid differ purely in CSS (image beside
 * the text, or above it). Two components would be two things to keep in step
 * for a difference that is entirely layout.
 *
 * Deliberately no comment or reaction counts — the blog has neither, and a row
 * of zeros advertises the absence.
 */
function Item({ post, accent }: { post: Post; accent: string }) {
  const date = shortDate(post.publishedAt);
  const foot = footLabel(post);
  const mins = readMinutes(post.content);
  return (
    <a className="card" style={{ ["--a" as string]: accent }} href={viewHref(post)} target="_blank" rel="noopener noreferrer">
      <div className="thumb">
        {post.coverImageUrl ? (
          // The card width is fluid in both views, so the intrinsic size is not
          // known here — `fill` inside a fixed-ratio box keeps every card's
          // image the same shape.
          <Image src={post.coverImageUrl} alt="" fill sizes="(max-width: 760px) 100vw, 340px" style={{ objectFit: "cover" }} />
        ) : (
          <span className="ph" aria-hidden>{(post.title || "?").slice(0, 1).toUpperCase()}</span>
        )}
      </div>
      <div className="cbody">
        <div className="cmeta">
          {date && <time dateTime={post.publishedAt ?? undefined}>{date}</time>}
          <span className="cread">{mins} min read</span>
        </div>
        <h3>{post.title}</h3>
        {post.author && (
          <div className="cauth">
            <span className="cavatar" aria-hidden>{post.author.slice(0, 1).toUpperCase()}</span>
            {post.author}
          </div>
        )}
        {post.excerpt && <p>{post.excerpt}</p>}
        {foot && <div className="cfoot">{foot}</div>}
      </div>
    </a>
  );
}

export function BlogBoard({ posts }: { posts: Post[] }) {
  // Theme is shared with the /posts layout (BlogThemeProvider) so this toggle
  // themes the WHOLE page — header + background — not just the board.
  const { theme, toggle } = useBlogTheme();
  const [active, setActive] = useState<ZoneKey>("edu");
  const [query, setQuery] = useState("");
  /** List is the default: it was the board's existing shape, and it fits more
   *  posts on screen. Grid is for browsing by cover art. */
  const [view, setView] = useState<View>("list");

  // Group posts by section once; sort each by rank (lower first), then newest.
  const byZone = useMemo(() => {
    const m: Record<ZoneKey, Post[]> = { edu: [], recap: [], research: [] };
    for (const p of posts) m[zoneOf(p)].push(p);
    (Object.keys(m) as ZoneKey[]).forEach((z) =>
      m[z].sort((a, b) => (a.rank - b.rank) || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
    );
    return m;
  }, [posts]);

  const q = query.trim().toLowerCase();

  /**
   * The search applies to EVERY section, not just the open one.
   *
   * The counts beside each section name previously showed the unfiltered
   * total, so a search could leave "Recap 2" beside a section holding no
   * matches — the number contradicted what clicking it would show. Filtering
   * once per zone here means the counts, the list, and the empty state all
   * describe the same result set.
   */
  const matches = (p: Post) =>
    !q ||
    p.title.toLowerCase().includes(q) ||
    (p.excerpt ?? "").toLowerCase().includes(q);

  const filteredByZone = useMemo(() => {
    const m: Record<ZoneKey, Post[]> = { edu: [], recap: [], research: [] };
    (Object.keys(byZone) as ZoneKey[]).forEach((z) => {
      m[z] = byZone[z].filter(matches);
    });
    return m;
    // `matches` closes over q, so q is the real dependency.
  }, [byZone, q]);

  const shown = filteredByZone[active];
  /** Sections that DO hold matches — used to rescue a dead-end search. */
  const withHits = SECTIONS.filter((s) => filteredByZone[s.key].length > 0);
  const accent = SECTIONS.find((s) => s.key === active)!.accent;

  return (
    <div className="mcb" data-theme={theme}>
      <header className="mast">
        <div className="mastTop">
          <div>
            <h1 className="blogh1">MarketCatalyst <span className="mk">blog</span></h1>
          </div>
          {/* View switch. Sits with the theme toggle because it is the same kind
              of control: how the reader wants the page drawn, not what it
              contains. */}
          <div className="viewSw" role="group" aria-label="Layout">
            <button
              type="button"
              className={view === "list" ? "on" : undefined}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden fill="currentColor">
                <rect x="1" y="2" width="14" height="3" rx="1" /><rect x="1" y="6.5" width="14" height="3" rx="1" /><rect x="1" y="11" width="14" height="3" rx="1" />
              </svg>
              List
            </button>
            <button
              type="button"
              className={view === "grid" ? "on" : undefined}
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1.2" /><rect x="9" y="1" width="6" height="6" rx="1.2" />
                <rect x="1" y="9" width="6" height="6" rx="1.2" /><rect x="9" y="9" width="6" height="6" rx="1.2" />
              </svg>
              Grid
            </button>
          </div>
          <button
            className="themeBtn"
            type="button"
            aria-pressed={theme === "light"}
            onClick={toggle}
          >
            <span className="bulb" style={{ background: theme === "light" ? "var(--recap)" : "var(--edu)" }} />
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
        <p className="sub">Articles from the MarketCatalyst desk — market fundamentals, period recaps, and research.</p>
      </header>

      <div className="layout">
        <aside className="side">
          <div className="search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles"
              aria-label="Search articles"
            />
          </div>

          <div className="secLbl">Sections</div>
          <nav className="secNav">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`secItem${active === s.key ? " on" : ""}`}
                style={{ ["--a" as string]: s.accent }}
                onClick={() => setActive(s.key)}
                aria-pressed={active === s.key}
              >
                <span className="dot" />
                <span className="secName">{s.title}</span>
                {/* Count follows the search, so it always matches what
                    clicking the section will actually show. */}
                <span className="secN">{filteredByZone[s.key].length}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className={`content ${view}`} style={{ ["--a" as string]: accent }}>
          {shown.length === 0 ? (
            <div className="empty">
              {!q ? (
                "Nothing published here yet."
              ) : withHits.length ? (
                /* The search runs across every section, so a miss in the open
                   one is a dead end only if we do not say where the hits are.
                   The counts already show it; this makes it clickable. */
                <>
                  No matches in this section. Found in{" "}
                  {withHits.map((s, i) => (
                    <span key={s.key}>
                      {i > 0 && (i === withHits.length - 1 ? " and " : ", ")}
                      <button
                        type="button"
                        className="emptyLink"
                        onClick={() => setActive(s.key)}
                      >
                        {s.title} ({filteredByZone[s.key].length})
                      </button>
                    </span>
                  ))}
                  .
                </>
              ) : (
                "No articles match your search."
              )}
            </div>
          ) : (
            shown.map((p) => <Item key={p.id} post={p} accent={accent} />)
          )}
        </main>
      </div>
    </div>
  );
}
