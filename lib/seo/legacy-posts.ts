import { DUPLICATE_POSTS } from "./duplicate-posts";
import { publicPostSlug } from "./shortened-posts";

/**
 * Posts that no longer exist (deleted, or published under a slug that has since
 * changed), as [old slug, where it goes now].
 *
 * Without an entry here a removed post answers 404, and any ranking or inbound
 * link it earned is lost; Search Console also keeps listing it as an error. Each
 * entry becomes a 301 in next.config.ts, and middleware.ts uses the same table
 * so an old /posts/view?slug=<slug> link reaches its destination in ONE hop
 * instead of redirecting to a /posts/<slug> that then redirects again.
 *
 * Point a slug at its closest live post, or at "/posts" when nothing fits.
 * Add a line whenever a post is deleted or renamed in the blog admin.
 *
 * IMPORTANT: a redirect here wins over a real page. If one of these slugs is
 * ever published again, delete its line first or the new post will be
 * unreachable.
 *
 * Plain data with relative imports only: next.config.ts loads this at build time.
 */
export const LEGACY_POST_REDIRECTS: [oldSlug: string, destination: string][] = [
  // Deleted daily recaps (404 in Search Console).
  ["dow-slides-0-7-as-yields-edge-higher-oil-dips-and-health-care-defies-downturn", "/posts?section=recap"],
  ["u-s-stocks-rally-to-fresh-peaks-as-tech-energy-and-yield-moves-fuel-optimism", "/posts?section=recap"],
  // Old /posts/view?slug=<slug> links that 308 to a post which no longer exists.
  ["investing-101", "/posts?section=educational"],
  ["test", "/posts"],
  // Dead link inside the Anthropic IPO article (the target was never published).
  // The link itself should also be fixed in the blog admin.
  ["anthropic-public-benefit-fund-5-percent-shares", "/posts"],
  // Unpublished posts and old slugs reported as 404 by the November SEO crawl.
  ["microsoft-stock-pops-as-copilot-relaunches-into-a-workplace-ai-hub", "/posts?section=news"],
  ["memory-stocks-slide-as-china-s-cxmt-flags-a-4f-dram-leap-what-it-means-for-micron-samsung-and-sk-hynix", "/posts?section=news"],
  ["s-p-500-slides-0-24-as-yields-climb-oil-dips-health-care-etf-gains-1-on-oct-7", "/posts?section=recap"],
  ["dow-s-p-nasdaq-slip-over-1-as-yields-edge-higher-health-care-leads-rally", "/posts?section=recap"],
  ["dow-s-p-nasdaq-slide-on-rising-yields-and-oil-dip-health-care-etf-xlv-up-1", "/posts?section=recap"],
  ["wall-st-slides-as-yields-rise-oil-dips-and-vix-climbs-nasdaq-drops-0-25-on-broad-weakness", "/posts?section=recap"],
  ["dow-s-p-nasdaq-slip-as-yields-rise-oil-falls-health-care-leads-gains", "/posts?section=recap"],
  // Old /posts/view?slug=<slug> links (the crawl found them under both hosts).
  ["10-moving-average-strategy", "/posts?section=educational"],
  ["risk-management", "/posts?section=educational"],
  ["technical-markets-2-3-pages", "/posts?section=analysis"],
  ["stock-research-2-3-pages", "/posts?section=analysis"],
  ["nvda-10-page-analysis-with-real-images-9mb", "/posts?section=analysis"],
  ["markets-2-3-pages", "/posts?section=analysis"],
];

const legacy = new Map<string, string>([
  ...LEGACY_POST_REDIRECTS,
  ...DUPLICATE_POSTS.map(([copy, original]): [string, string] => [copy, `/posts/${publicPostSlug(original)}`]),
]);

/** Where an old or duplicate post slug now lives, or undefined if it is not in either table. */
export function resolveLegacyPost(slug: string): string | undefined {
  return legacy.get(slug);
}
