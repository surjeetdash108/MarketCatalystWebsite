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
  // Posts re-published under the 80-character slug (lib/seo/shorten.ts). The long slugs are still
  // linked from inside the site (the November crawl: 404s with 1-13 inlinks each). Each goes to
  // the same post's live URL. The links themselves should also be fixed in the blog admin.
  ["fastly-q3-adjusted-eps-jumps-143-to-0-17-and-revenue-rises-20-to-190-2m-beating-estimates", "/posts/fastly-q3-adjusted-eps-jumps-143-to-0-17-and-revenue-rises-20-to-190-2m-beating"],
  ["figma-beats-q3-guides-q4-revenue-to-402m-404m-and-raises-fy26-revenue-outlook-to-1-5b", "/posts/figma-beats-q3-guides-q4-revenue-to-402m-404m-and-raises-fy26-revenue-outlook"],
  ["dave-raises-fy26-outlook-as-q3-revenue-jumps-31-to-197-7m-but-adjusted-eps-slips-1-to-4-39", "/posts/dave-raises-fy26-outlook-as-q3-revenue-jumps-31-to-197-7m-but-adjusted-eps-slips"],
  ["fastly-s-go-to-market-chief-plans-to-retire-as-growth-leans-on-its-top-10-customers", "/posts/fastly-s-go-to-market-chief-plans-to-retire-as-growth-leans-on-its-top-10"],
  ["freshworks-passes-1b-in-arr-as-revenue-rises-14-and-margin-hits-29-8-but-q4-profit-guide-dips", "/posts/freshworks-passes-1b-in-arr-as-revenue-rises-14-and-margin-hits-29-8-but-q4"],
  ["amd-beats-as-q3-revenue-jumps-45-to-13-38b-on-97-data-center-growth-and-q4-guide-tops-17b", "/posts/amd-beats-as-q3-revenue-jumps-45-to-13-38b-on-97-data-center-growth-and-q4-guide"],
  ["arista-revenue-surges-58-5-to-3-66b-topping-its-own-guide-as-q4-outlook-points-to-3-9b-4-0b", "/posts/arista-revenue-surges-58-5-to-3-66b-topping-its-own-guide-as-q4-outlook-points"],
  ["skyworks-q4-revenue-slips-5-to-1-05b-as-qorvo-deal-closes-and-smartphone-sales-are-seen-falling", "/posts/skyworks-q4-revenue-slips-5-to-1-05b-as-qorvo-deal-closes-and-smartphone-sales"],
  ["duolingo-daily-users-jump-29-to-64-9m-as-q3-bookings-top-guidance-and-the-full-year-outlook-rises", "/posts/duolingo-daily-users-jump-29-to-64-9m-as-q3-bookings-top-guidance-and-the-full"],
  ["why-ai-picks-and-shovels-stocks-are-falling-midterm-sweep-moratorium-fears-oracle-s-20b-raise", "/posts/why-ai-picks-and-shovels-stocks-are-falling-midterm-sweep-moratorium-fears"],
  ["openai-cfo-confirms-1-25t-raise-talks-says-data-center-spending-continues-despite-voter-backlash", "/posts/openai-cfo-confirms-1-25t-raise-talks-says-data-center-spending-continues"],
  ["anthropic-launches-claude-personal-finance-linking-bank-accounts-through-plaid-in-a-u-s-beta", "/posts/anthropic-launches-claude-personal-finance-linking-bank-accounts-through-plaid"],
  ["coreweave-s-2032-bond-yield-tops-16-as-the-cost-of-borrowing-for-ai-data-centers-climbs", "/posts/coreweave-s-2032-bond-yield-tops-16-as-the-cost-of-borrowing-for-ai-data-centers"],
  ["openai-is-reportedly-building-a-search-console-style-analytics-tool-for-businesses-in-chatgpt", "/posts/openai-is-reportedly-building-a-search-console-style-analytics-tool"],
  ["oracle-s-165b-new-mexico-data-center-faces-delay-as-developer-waives-air-permit-deadline", "/posts/oracle-s-165b-new-mexico-data-center-faces-delay-as-developer-waives-air-permit"],
  ["google-could-take-equity-in-terawulf-s-kentucky-project-if-anthropic-defaults-on-19b-lease", "/posts/google-could-take-equity-in-terawulf-s-kentucky-project-if-anthropic-defaults"],
  ["meta-prices-15b-bond-across-five-maturities-with-coupons-from-5-85-to-7-50-about-990m-a-year", "/posts/meta-prices-15b-bond-across-five-maturities-with-coupons-from-5-85-to-7-50-about"],
  ["anthropic-ipo-valuation-talks-slip-to-1-2t-1-3t-as-low-as-1-1t-after-nasdaq-100-rout", "/posts/anthropic-ipo-valuation-talks-slip-to-1-2t-1-3t-as-low-as-1-1t-after-nasdaq-100"],
  ["spacex-s-nationwide-wireless-buildout-could-cost-100b-or-more-analyst-says-as-qualcomm-signs-on", "/posts/spacex-s-nationwide-wireless-buildout-could-cost-100b-or-more-analyst-says"],
  ["agility-robotics-goes-public-with-465m-raised-at-a-2-5b-valuation-on-1-8m-in-2025-sales", "/posts/agility-robotics-goes-public-with-465m-raised-at-a-2-5b-valuation-on-1-8m"],
  ["why-datadog-fell-14-after-a-q3-beat-a-flat-q4-guide-and-a-largest-customer-question", "/posts/why-datadog-fell-14-after-a-q3-beat-a-flat-q4-guide-and-a-largest-customer"],
  ["midterm-returns-hit-asian-tech-nikkei-falls-2-9-nasdaq-futures-drop-1-8-and-the-dollar-weakens", "/posts/midterm-returns-hit-asian-tech-nikkei-falls-2-9-nasdaq-futures-drop-1-8"],
  ["terawulf-gets-google-credit-backstop-for-19b-anthropic-lease-signs-fluor-to-build-3-data-centers", "/posts/terawulf-gets-google-credit-backstop-for-19b-anthropic-lease-signs-fluor"],
  ["oracle-reportedly-scraps-7b-tencent-ai-chip-lease-after-u-s-pressure-blocking-100-000-chips", "/posts/oracle-reportedly-scraps-7b-tencent-ai-chip-lease-after-u-s-pressure-blocking"],
  ["procore-beats-as-q3-revenue-climbs-18-7-to-402m-guides-q4-above-consensus-and-adds-300m-buyback", "/posts/procore-beats-as-q3-revenue-climbs-18-7-to-402m-guides-q4-above-consensus"],
  ["omega-healthcare-raises-2026-ffo-outlook-as-q3-beats-by-0-02-but-revenue-falls-3-and-misses", "/posts/omega-healthcare-raises-2026-ffo-outlook-as-q3-beats-by-0-02-but-revenue-falls-3"],
  ["after-hours-movers-flywire-jumps-13-and-skyworks-sinks-15-as-arista-duolingo-and-procore-rally", "/posts/after-hours-movers-flywire-jumps-13-and-skyworks-sinks-15-as-arista-duolingo"],
  ["gxo-beats-as-q3-organic-revenue-growth-hits-6-4-and-adjusted-eps-reaches-0-89-outlook-held", "/posts/gxo-beats-as-q3-organic-revenue-growth-hits-6-4-and-adjusted-eps-reaches-0-89"],
];

const legacy = new Map<string, string>([
  ...LEGACY_POST_REDIRECTS,
  ...DUPLICATE_POSTS.map(([copy, original]): [string, string] => [copy, `/posts/${publicPostSlug(original)}`]),
]);

/** Where an old or duplicate post slug now lives, or undefined if it is not in either table. */
export function resolveLegacyPost(slug: string): string | undefined {
  return legacy.get(slug);
}
