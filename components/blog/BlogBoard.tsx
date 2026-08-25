"use client";

import { useMemo, useState } from "react";
import type { Post } from "@/lib/blog/posts";

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
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function byline(post: Post): string {
  return [`${readMinutes(post.content)} min`, shortDate(post.publishedAt)].filter(Boolean).join(" · ");
}

function viewHref(post: Post): string {
  return `/posts/view?slug=${encodeURIComponent(post.slug)}`;
}

function Item({ post, accent }: { post: Post; accent: string }) {
  return (
    <a className="item" style={{ ["--a" as string]: accent }} href={viewHref(post)} target="_blank" rel="noopener noreferrer">
      <h3>{post.title}</h3>
      {post.excerpt && <p>{post.excerpt}</p>}
      <div className="by">{byline(post)}</div>
    </a>
  );
}

export function BlogBoard({ posts }: { posts: Post[] }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  const [active, setActive] = useState<ZoneKey>("edu");
  const [query, setQuery] = useState("");

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
  const shown = byZone[active].filter(
    (p) => !q || p.title.toLowerCase().includes(q) || (p.excerpt ?? "").toLowerCase().includes(q),
  );
  const accent = SECTIONS.find((s) => s.key === active)!.accent;

  return (
    <div className="mcb" data-theme={theme}>
      <header className="mast">
        <div className="mastTop">
          <div>
            <div className="eyebrow">MarketCatalyst · Knowledge base</div>
            <h1 className="blogh1">MarketCatalyst <span className="mk">blog</span></h1>
          </div>
          <button
            className="themeBtn"
            type="button"
            aria-pressed={theme === "light"}
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
          >
            <span className="bulb" style={{ background: theme === "light" ? "var(--recap)" : "var(--edu)" }} />
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
        <p className="sub">Articles from the MarketCatalyst desk — market fundamentals, period recaps, and research written in house.</p>
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
                <span className="secN">{byZone[s.key].length}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="content" style={{ ["--a" as string]: accent }}>
          {shown.length === 0 ? (
            <div className="empty">
              {q ? "No articles match your search." : "Nothing published here yet."}
            </div>
          ) : (
            shown.map((p) => <Item key={p.id} post={p} accent={accent} />)
          )}
        </main>
      </div>
    </div>
  );
}
