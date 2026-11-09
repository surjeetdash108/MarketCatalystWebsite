import { readFileSync } from "node:fs";
import path from "node:path";
import { GTM_VALID_ID, gtmBootstrap, gtmNoscriptSrc } from "@/lib/analytics/gtm";
import { GA4_ID, gtagConfig, gtagSrc } from "@/lib/analytics/ga";
import { DEFAULT_OG_IMAGE } from "@/lib/seo/og";
import { SCHEMA_ORG_JSON_LD } from "@/lib/seo/schema-org";
import { fallbackCatalog, fillPriceTokens, type CatalogPlan } from "@/lib/pricing/catalog";

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
 * Replacing the page is a file swap: copy the new build over home.html. Nothing
 * here needs to change unless it stops having a <title> / description.
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
    `<meta property="og:url" content="${SITE_URL}">`,
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

/** The home page document: home.html with the site-wide tags added. */
/**
 * The home page with the pricing tiles filled from the plan catalog
 * (`plans`: GET /plans, or the generated fallback copy).
 */
export function homeDocument(plans: CatalogPlan[] = fallbackCatalog()): string {
  const html = fillPriceTokens(readFileSync(path.join(process.cwd(), "lib", "landing", "home.html"), "utf8"), plans);

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
