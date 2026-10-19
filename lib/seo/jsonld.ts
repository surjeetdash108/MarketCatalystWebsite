import type { Post } from "@/lib/blog/posts";
import type { Faq } from "@/lib/faq/faqs";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

/**
 * Produces a concise, natural SEO description strictly under maxChars (default 119 characters).
 * Never truncates in the middle of a word or cuts off an incomplete thought awkwardly:
 * 1. Strips HTML/markdown and normalizes spaces.
 * 2. If already <= maxChars, uses it as is.
 * 3. If multiple sentences exist, fits the complete first sentence (or sentences) cleanly.
 * 4. If a single sentence exceeds the limit, truncates at the last full word boundary
 *    and appends an ellipsis without cutting words.
 */
export function summarizeForSeo(text: string | null | undefined, maxChars = 119): string | undefined {
  if (!text) return undefined;

  // Clean HTML tags, markdown syntax, and normalize spaces
  const clean = text
    .replace(/<[^>]*>/g, " ")
    .replace(/[*_#`~[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) return undefined;
  if (clean.length <= maxChars) return clean;

  // Attempt sentence-level split
  const sentenceMatches = clean.match(/[^.!?]+[.!?]+(?:\s+|$)/g);
  if (sentenceMatches && sentenceMatches.length > 0) {
    let combined = "";
    for (const s of sentenceMatches) {
      const candidate = (combined + (combined ? " " : "") + s.trim()).trim();
      if (candidate.length <= maxChars) {
        combined = candidate;
      } else {
        break;
      }
    }
    // If we got at least one full sentence of good substance (>= 30 chars), use it
    if (combined.length >= 30) {
      return combined;
    }
  }

  // If the first sentence itself is longer than maxChars, or no sentence punctuation:
  // Break at the last word boundary before (maxChars - 3) to allow for "..."
  const budget = maxChars - 3;
  const slice = clean.slice(0, budget);
  const lastSpace = slice.lastIndexOf(" ");

  const wordSafe = lastSpace > 25 ? slice.slice(0, lastSpace) : slice;
  const stripped = wordSafe.replace(/[,;:\-\s]+$/, "");

  return `${stripped}...`;
}

export function buildArticleJsonLd(post: Post) {
  const url = post.seo.canonicalUrl || `${siteUrl()}/posts/${post.slug}`;
  const image = post.seo.ogImageUrl || post.coverImageUrl || undefined;
  const rawDescription = post.seo.metaDescription || post.excerpt || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo.metaTitle || post.title,
    description: summarizeForSeo(rawDescription, 119),
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
