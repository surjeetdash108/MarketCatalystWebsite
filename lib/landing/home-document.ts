import { readFileSync } from "node:fs";
import path from "node:path";
import { GTM_VALID_ID, gtmBootstrap, gtmNoscriptSrc } from "@/lib/analytics/gtm";
import { GA4_ID, gtagConfig, gtagSrc } from "@/lib/analytics/ga";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/og";
import { SCHEMA_ORG_JSON_LD } from "@/lib/seo/schema-org";
import { fallbackCatalog, fillPriceTokens, type CatalogPlan } from "@/lib/pricing/catalog";
import { WORKSPACE_COUNT } from "@/lib/features/features";
import { postPath } from "@/lib/seo/shortened-posts";

/**
 * The home page.
 *
 * `lib/landing/home.html` is the self-contained landing page (hero, interactive
 * product tour, pricing, footer) saved from the design build, byte for byte. It
 * is not a React page, so nothing the root layout normally adds to a page's
 * <head> reaches it. This adds that back, from the same constants the layout
 * uses, and leaves everything the visitor sees untouched:
 *
 *   canonical, icons, RSS link, Open Graph + Twitter card, schema.org JSON-LD,
 *   and Google Tag Manager when NEXT_PUBLIC_GTM_ID is set.
 *
 * The title and description are read from the file itself, so the social cards
 * always match the page.
 *
 * Replacing the page is a file swap: copy the new build over home.html, then run
 * `node scripts/slim-home.mjs`. The design build inlines its fonts, hero image and
 * tour script (~8 MB); that script moves them to public/landing so the page is
 * ~220 KB and can paint quickly. Nothing here needs to change unless the file stops
 * having a <title> / description.
 */

const SITE_URL = "https://marketcatalyst.ai";

const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The title and meta description the file already declares (entities left as written). */
function ownTitleAndDescription(html: string): { title: string; description: string } {
  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1];
  const description = /<meta\s+name="description"\s+content="([^"]*)"/.exec(html)?.[1];
  if (!title || !description) throw new Error("lib/landing/home.html needs a <title> and a meta description");
  // The description is already attribute-safe (read from an attribute); the title
  // came from element text, so only a stray quote could break the tags below.
  return { title: title.replace(/"/g, "&quot;"), description };
}

function headTags(html: string): string {
  const { title, description } = ownTitleAndDescription(html);
  const image = `${SITE_URL}${DEFAULT_OG_IMAGE.url}`;
  // Same graph as app/layout.tsx; `<` is escaped so it can never close the tag.
  const jsonLd = JSON.stringify(SCHEMA_ORG_JSON_LD).replace(/</g, "\\u003c");

  return [
    `<link rel="canonical" href="${SITE_URL}/">`,
    `<link rel="icon" href="/icon.png" sizes="32x32" type="image/png">`,
    `<link rel="icon" href="/favicon.ico" sizes="any">`,
    `<link rel="apple-touch-icon" href="/apple-icon.png">`,
    `<link rel="alternate" type="application/rss+xml" title="MarketCatalyst" href="/feed.xml">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${SITE_URL}/">`,
    `<meta property="og:site_name" content="MarketCatalyst">`,
    `<meta property="og:title" content="${title}">`,
    `<meta property="og:description" content="${description}">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta property="og:image:width" content="${DEFAULT_OG_IMAGE.width}">`,
    `<meta property="og:image:height" content="${DEFAULT_OG_IMAGE.height}">`,
    `<meta property="og:image:alt" content="${esc(DEFAULT_OG_IMAGE.alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${title}">`,
    `<meta name="twitter:description" content="${description}">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    `<meta name="twitter:image:alt" content="${esc(DEFAULT_OG_IMAGE.alt)}">`,
    `<script type="application/ld+json">${jsonLd}</script>`,
    ...(GTM_VALID_ID ? [`<script>${gtmBootstrap(GTM_VALID_ID)}</script>`] : []),
    // Google tag (gtag.js), as on every React page (components/analytics/GoogleAnalytics.tsx).
    `<script async src="${gtagSrc(GA4_ID)}"></script>`,
    `<script>${gtagConfig(GA4_ID)}</script>`,
  ].join("\n");
}


/** The newest posts shown on the home page: enough of a post to link to it. */
export type HomePost = { title: string; slug: string; publishedAt: string | null };

const LATEST_POSTS_SLOT = "<!--MC_LATEST_POSTS-->";
/** The workspace count on the Market Catalyst tile, filled from WORKSPACE_COUNT so it matches every other page. */
const WORKSPACE_COUNT_SLOT = "__MC_WORKSPACE_COUNT__";

const LATEST_POSTS_CSS = `.mc-latest{padding:clamp(56px,9vh,110px) var(--mc-gutter);position:relative}
.mc-latest-inner{max-width:var(--mc-maxw);margin:0 auto}
.mc-latest-k{font-family:var(--mc-font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--mc-up)}
.mc-latest-h{margin:14px 0 32px;font-size:clamp(26px,3.4vw,44px);font-weight:600;letter-spacing:-.04em;line-height:1}
.mc-latest-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;list-style:none;margin:0;padding:0}
.mc-latest-card{display:flex;flex-direction:column;gap:12px;height:100%;box-sizing:border-box;background:var(--mc-bg-card);border:1px solid var(--mc-line);border-radius:12px;padding:22px;color:var(--mc-text);text-decoration:none;transition:background .2s,border-color .2s}
.mc-latest-card:hover{background:var(--mc-bg-hover);border-color:var(--mc-line-strong)}
.mc-latest-card time{font-family:var(--mc-font-mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--mc-text-faint)}
.mc-latest-card span{font-size:17px;font-weight:600;line-height:1.3}
.mc-latest-all{display:inline-block;margin-top:26px;color:var(--mc-up);text-decoration:none;font-size:15px}
.mc-latest-all:hover{text-decoration:underline}
@media (max-width:860px){.mc-latest-grid{grid-template-columns:1fr}}`;

/** "Nov 18, 2026", in UTC so the build machine's time zone cannot move the date. */
function postDate(iso: string): { text: string; attr: string } | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return {
    text: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
    attr: d.toISOString().slice(0, 10),
  };
}

/**
 * A "Latest market recaps" section linking the newest posts: fresh internal links
 * for crawlers and a visible sign that the product is active. Empty when there are
 * no posts, so a failed read never leaves a blank section on the page.
 */
export function latestPostsBlock(posts: HomePost[]): string {
  if (posts.length === 0) return "";
  const items = posts
    .map((p) => {
      const date = p.publishedAt ? postDate(p.publishedAt) : null;
      const time = date ? `<time datetime="${date.attr}">${esc(date.text)}</time>` : "";
      return `<li><a class="mc-latest-card" href="${esc(postPath(p.slug))}">${time}<span>${esc(p.title)}</span></a></li>`;
    })
    .join("");
  return (
    `<section class="mc-latest" id="latest" aria-labelledby="mc-latest-h">` +
    `<style>${LATEST_POSTS_CSS}</style>` +
    `<div class="mc-latest-inner"><div class="mc-latest-k">Daily market recaps</div>` +
    `<h2 class="mc-latest-h" id="mc-latest-h">Latest market recaps</h2>` +
    `<ul class="mc-latest-grid">${items}</ul>` +
    `<a class="mc-latest-all" href="/posts?section=recap">All market recaps &rarr;</a></div></section>`
  );
}

/** The home page document: home.html with the site-wide tags added. */
/**
 * The home page with the pricing tiles filled from the plan catalog
 * (`plans`: GET /plans, or the generated fallback copy) and the newest posts
 * linked in the "Latest market recaps" section (`posts`, newest first).
 */
export function homeDocument(plans: CatalogPlan[] = fallbackCatalog(), posts: HomePost[] = []): string {
  const html = fillPriceTokens(readFileSync(path.join(process.cwd(), "lib", "landing", "home.html"), "utf8"), plans)
    .replace(LATEST_POSTS_SLOT, latestPostsBlock(posts))
    .replace(WORKSPACE_COUNT_SLOT, String(WORKSPACE_COUNT));

  // The first </head> and the first <body> are the page's own; later ones are
  // inside the About page the file carries as inert text.
  const headEnd = html.indexOf("</head>");
  const bodyOpen = /<body\b[^>]*>/.exec(html);
  if (headEnd < 0 || !bodyOpen || bodyOpen.index < headEnd) {
    throw new Error("lib/landing/home.html: could not find the document's <head> and <body>");
  }

  const bodyEnd = bodyOpen.index + bodyOpen[0].length;
  const noscript = GTM_VALID_ID
    ? `<noscript><iframe src="${gtmNoscriptSrc(GTM_VALID_ID)}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`
    : "";

  return (
    html.slice(0, headEnd) +
    headTags(html) +
    "\n" +
    html.slice(headEnd, bodyEnd) +
    noscript +
    html.slice(bodyEnd)
  );
}
