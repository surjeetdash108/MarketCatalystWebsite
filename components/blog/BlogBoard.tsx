"use client";

import { useState } from "react";
import type { Post } from "@/lib/blog/posts";

/**
 * Public blog board for /posts — the approved "MarketCatalyst blog" layout.
 * Published posts are grouped into four zones by category; every card opens the
 * full article (/posts/view?slug=…) in a NEW TAB. Styling lives in
 * app/posts/blog-board.css, scoped under `.mcb`.
 */

type ZoneKey = "lead" | "stock" | "edu" | "news";

const ZONE_META: Record<ZoneKey, { title: string; accent: string }> = {
  stock: { title: "Stock 101", accent: "var(--stock)" },
  lead: { title: "Featured", accent: "var(--lead)" },
  edu: { title: "Educational 101", accent: "var(--edu)" },
  news: { title: "Market 101", accent: "var(--news)" },
};

/** Map a post to a zone by its explicit `type` field (the source of truth). */
function zoneOf(post: Post): ZoneKey {
  switch (post.type) {
    case "stock":
      return "stock";
    case "educational":
      return "edu";
    case "market":
      return "news";
    case "featured":
    default:
      return "lead";
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
        {posts.length === 0 ? <div className="zempty">Nothing here yet.</div> : posts.map((p) => <Item key={p.id} post={p} accent={accent} />)}
      </div>
    </div>
  );
}

function FeaturedPanel({ posts }: { posts: Post[] }) {
  const { title, accent } = ZONE_META.lead;
  const [lead, ...rest] = posts;
  return (
    <div className="panel" style={{ ["--a" as string]: accent }}>
      <div className="ph"><i /><h2>{title}</h2><span className="n">{posts.length} {posts.length === 1 ? "article" : "articles"}</span></div>
      {lead ? (
        <a className="lead" href={viewHref(lead)} target="_blank" rel="noopener noreferrer">
          <div className="rule" />
          <h3>{lead.title}</h3>
          {lead.excerpt && <p>{lead.excerpt}</p>}
          <div className="by">{byline(lead)}</div>
        </a>
      ) : (
        <div className="tray"><div className="zempty">Nothing featured yet.</div></div>
      )}
      {rest.length > 0 && (
        <div className="rest">
          {rest.map((p) => <Item key={p.id} post={p} accent={accent} />)}
        </div>
      )}
    </div>
  );
}

function MarqueePanel({ posts }: { posts: Post[] }) {
  const { title, accent } = ZONE_META.news;
  // Two identical sets so the CSS keyframe (travels one set) loops seamlessly.
  const loop = posts.length > 0 ? [...posts, ...posts] : [];
  return (
    <div className="panel" style={{ ["--a" as string]: accent }}>
      <div className="ph"><i /><h2>{title}</h2><span className="n">{posts.length} {posts.length === 1 ? "article" : "articles"}{posts.length > 1 ? " · hover to pause" : ""}</span></div>
      {posts.length === 0 ? (
        <div className="tray"><div className="zempty">Nothing here yet.</div></div>
      ) : (
        <div className="marquee">
          <div className="track">
            {loop.map((p, i) => (
              <a key={`${p.id}-${i}`} className="ncard" style={{ ["--a" as string]: accent }} href={viewHref(p)} target="_blank" rel="noopener noreferrer">
                <h3>{p.title}</h3>
                {p.excerpt && <p>{p.excerpt}</p>}
                <div className="by">{byline(p)}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function BlogBoard({ posts }: { posts: Post[] }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  const zones: Record<ZoneKey, Post[]> = { lead: [], stock: [], edu: [], news: [] };
  for (const p of posts) zones[zoneOf(p)].push(p);

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
            <span className="bulb" style={{ background: theme === "light" ? "var(--lead)" : "var(--edu)" }} />
            <span>{theme === "light" ? "Dark" : "Light"}</span>
          </button>
        </div>
        <p className="sub">Articles from the MarketCatalyst desk, grouped by what they cover — individual stocks, market fundamentals, and market blogs.</p>
      </header>

      <div className="board">
        <div className="l"><TrayPanel zone="stock" posts={zones.stock} /></div>
        <div className="c"><FeaturedPanel posts={zones.lead} /></div>
        <div className="r"><TrayPanel zone="edu" posts={zones.edu} /></div>
        <div className="b"><MarqueePanel posts={zones.news} /></div>
      </div>
    </div>
  );
}
