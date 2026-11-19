import { siteUrl } from "@/lib/seo/feeds";

/**
 * /llms.txt: a short plain-text map of the site for AI assistants and crawlers
 * (the llms.txt convention). It only points at pages that exist and repeats what
 * the home page already says; prices are left out on purpose because they come
 * from the live plan catalog and would go stale here.
 */
export const dynamic = "force-static";

export function GET() {
  const base = siteUrl();
  const body = `# MarketCatalyst

> AI stock research and market intelligence for retail traders. Every stock is scored on business, earnings, valuation, technicals, flows and macro, so you can see why it moved and what could move it next.

## Product
- [Home](${base}/): what MarketCatalyst does, the workspaces, and plans
- [Sign up](https://app.marketcatalyst.ai/auth/signup): create an account in the web app

## Research and market recaps
- [Posts](${base}/posts): daily market recaps, news, earnings, research and educational articles
- [Market recaps](${base}/posts?section=recap): the daily recap of how the market moved and why
- [RSS feed](${base}/feed.xml): the latest posts

## Company
- [About](${base}/about)
- [FAQs](${base}/faqs)
- [Contact](${base}/contact)
- [Careers](${base}/careers)

## Legal
- [Privacy Policy](${base}/legal/privacy)
- [Terms of Service](${base}/legal/terms)

MarketCatalyst is a research and education product, not investment advice.
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
