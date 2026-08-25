"use client";

import { useState } from "react";
import type { Post } from "@/lib/blog/posts";

/**
 * Public blog board for /posts — the "MarketCatalyst blog" layout. Published
 * posts are grouped into THREE sections by their explicit `type` field
 * (educational | recap | research); every card opens the full article
 * (/posts/view?slug=…) in a NEW TAB. Styling lives in app/posts/blog-board.css,
 * scoped under `.mcb`.
 */

type ZoneKey = "edu" | "recap" | "research";

const ZONE_META: Record<ZoneKey, { title: string; accent: string }> = {
  edu: { title: "Educational", accent: "var(--edu)" },
  recap: { title: "Recap", accent: "var(--recap)" },
  research: { title: "Research desk", accent: "var(--research)" },
};

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

function TrayPanel({ zone, posts }: { zone: ZoneKey; posts: Post[] }) {
  const { title, accent } = ZONE_META[zone];
  return (
    <div className="panel" style={{ ["--a" as string]: accent }}>
      <div className="ph"><i /><h2>{title}</h2><span className="n">{posts.length} {posts.length === 1 ? "article" : "articles"}</span></div>
      <div className="tray">
        {posts.length === 0 ? <div className="zempty">Nothing published here yet.</div> : posts.map((p) => <Item key={p.id} post={p} accent={accent} />)}
      </div>
    </div>
  );
}

export function BlogBoard({ posts }: { posts: Post[] }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  const zones: Record<ZoneKey, Post[]> = { edu: [], recap: [], research: [] };
  for (const p of posts) zones[zoneOf(p)].push(p);
  // Order within each section by rank (lower first), then newest.
  (Object.keys(zones) as ZoneKey[]).forEach((z) =>
    zones[z].sort((a, b) => (a.rank - b.rank) || (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "")),
  );

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
        <p className="sub">Articles from the MarketCatalyst desk — educational explainers, period recaps, and research written in house.</p>
      </header>

      <div className="board">
        <div className="edu"><TrayPanel zone="edu" posts={zones.edu} /></div>
        <div className="recap"><TrayPanel zone="recap" posts={zones.recap} /></div>
        <div className="research"><TrayPanel zone="research" posts={zones.research} /></div>
      </div>
    </div>
  );
}
