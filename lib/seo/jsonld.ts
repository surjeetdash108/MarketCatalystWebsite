import type { Post } from "@/lib/blog/posts";
import type { Faq } from "@/lib/faq/faqs";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

export function buildArticleJsonLd(post: Post) {
  const url = post.seo.canonicalUrl || `${siteUrl()}/posts/${post.slug}`;
  const image = post.seo.ogImageUrl || post.coverImageUrl || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo.metaTitle || post.title,
    description: post.seo.metaDescription || post.excerpt || undefined,
    // A PDF post renders its pages as images, so the page carries no readable
    // body text. The extracted text is published here instead — it is the same
    // article the images show, which is what articleBody is for, and without it
    // the post would offer a crawler nothing beyond its title.
    articleBody: post.pdfUrl ? post.content || undefined : undefined,
    image,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    mainEntityOfPage: url,
    author: {
      "@type": "Organization",
      name: "MarketCatalyst",
    },
  };
}

/**
 * Serialises JSON-LD for a <script> body. `<` is escaped so text that came
 * from the CMS (an FAQ answer containing "</script>", say) cannot close the
 * tag early; JSON parsers read < as the same character.
 */
export function serializeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Homepage: who runs the site. The square logo meets Google's 112px minimum. */
export function buildOrganizationJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${url}/#organization`,
    name: "MarketCatalyst",
    url,
    logo: `${url}/logo-square.png`,
    description:
      "AI stock market research platform: earnings, movers, analyst actions, insider flows and your portfolio in one terminal.",
  };
}

/** Homepage: the site's name as search results should show it. */
export function buildWebSiteJsonLd() {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: "MarketCatalyst",
    url,
    publisher: { "@id": `${url}/#organization` },
  };
}

/** /faqs: every public question and answer, from the same list the page renders. */
export function buildFaqPageJsonLd(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
