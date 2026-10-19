import type { Post } from "@/lib/blog/posts";
import type { Faq } from "@/lib/faq/faqs";
import curatedDescriptionsRaw from "./curated-descriptions.json";

const curatedDescriptions: Record<string, string> = curatedDescriptionsRaw as Record<string, string>;

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

const ABBREV_REGEX = /\b(Oct|Sep|Sept|Nov|Dec|Jan|Feb|Mar|Apr|Jun|Jul|Aug|vs|Corp|Inc|Co|Ltd|a\.m|p\.m|U\.S|No|Dr|Mr|Mrs|Ms|St)\./gi;

function protectTokens(text: string): string {
  // Protect decimal numbers like 6.5, $1.58, 3.14 so they are not treated as sentence ends
  let t = text.replace(/(\d+)\.(\d+)/g, "$1__DOT__$2");
  // Protect single-letter initials like J.B. or R.
  t = t.replace(/\b([A-Za-z])\./g, "$1__DOT__");
  // Protect known abbreviations like Oct., a.m., vs., Inc., etc.
  t = t.replace(ABBREV_REGEX, (match, prefix) => `${prefix}__DOT__`);
  t = t.replace(/\b([ap])__DOT__m\./gi, "$1__DOT__m__DOT__");
  t = t.replace(/\bU__DOT__S\./g, "U__DOT__S__DOT__");
  return t;
}

function unprotectTokens(text: string): string {
  return text.replace(/__DOT__/g, ".");
}

const CLAUSE_CONNECTORS = [
  /, while /i,
  /, as /i,
  /, but /i,
  /, though /i,
  /, despite /i,
  /, even as /i,
  /, yet /i,
  /, with /i,
  /, driving /i,
  /, raising /i,
  /, sending /i,
  /, prompting /i,
  /, dragging /i,
  /, pushing /i,
  /, lifting /i,
  /, erasing /i,
  /, adding /i,
  /, after /i,
  /, before /i,
  /; /,
  /, and /i,
];

function cleanSentence(s: string): string {
  let clean = s.replace(/^[\s:;,\-–—]+/, "").trim();
  // Strip trailing punctuation first so we can check ending words
  clean = clean.replace(/[.!?]+$/, "").trim();
  // Strip trailing single prepositions/conjunctions
  clean = clean.replace(
    /\b(on|a|an|the|in|with|and|or|to|for|of|by|at|from|that|which|as|after|amid|over|under|despite|while|before|until)\b[\s,;:\-–—]*$/i,
    ""
  ).trim();
  clean = clean.replace(/[\s,;:\-–—]+$/, "");
  if (clean && !/[.!?]$/.test(clean)) {
    clean += ".";
  }
  return clean;
}

/**
 * Produces a concise, natural SEO description strictly under maxChars (default 119 characters).
 * Never truncates with "...", never starts mid-sentence, and never breaks on decimals or abbreviations:
 * 1. Strips HTML/markdown and normalizes spaces.
 * 2. If already <= maxChars, cleans and uses it as is.
 * 3. Splits sentences respecting decimals (6.5%), abbreviations (a.m., vs.), and initials.
 * 4. If a sentence exceeds maxChars, breaks at natural clause boundaries (, as, , while, etc.)
 *    ensuring complete thoughts and grammatical integrity without trailing ellipsis.
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
  if (clean.length <= maxChars) return cleanSentence(clean);

  const protectedText = protectTokens(clean);
  const rawSentences = protectedText
    .split(/\.(?:\s+|$)/)
    .map(s => s.trim())
    .filter(Boolean);
  const sentences = rawSentences.map(s => cleanSentence(unprotectTokens(s)));

  // If first sentence fits cleanly and has substance
  if (sentences.length > 0) {
    const s0 = sentences[0];
    if (s0.length >= 45 && s0.length <= maxChars) {
      return s0;
    }
    // Try combining sentences if multiple fit under limit
    let combined = s0;
    for (let i = 1; i < sentences.length; i++) {
      const candidate = `${combined} ${sentences[i]}`;
      if (candidate.length <= maxChars) {
        combined = candidate;
      } else {
        break;
      }
    }
    if (combined.length >= 45 && combined.length <= maxChars) {
      return combined;
    }
  }

  // If first sentence is longer than maxChars, find the best natural clause break
  const targetProtected = protectTokens(sentences[0] || clean).replace(/[.!?]+$/, "");
  let bestCandidate: string | null = null;

  for (const connector of CLAUSE_CONNECTORS) {
    const parts = targetProtected.split(connector);
    if (parts.length > 1) {
      const candidate = cleanSentence(unprotectTokens(parts[0]));
      if (candidate.length >= 45 && candidate.length <= maxChars) {
        if (!bestCandidate || candidate.length > bestCandidate.length) {
          bestCandidate = candidate;
        }
      }
    }
  }

  if (bestCandidate) {
    return bestCandidate;
  }

  // Try breaking at commas from right to left
  let lastCommaIdx = targetProtected.lastIndexOf(",");
  while (lastCommaIdx > 35) {
    const candidate = cleanSentence(unprotectTokens(targetProtected.slice(0, lastCommaIdx)));
    if (candidate.length >= 40 && candidate.length <= maxChars) {
      return candidate;
    }
    lastCommaIdx = targetProtected.lastIndexOf(",", lastCommaIdx - 1);
  }

  // Word boundary break with preposition stripping — NEVER ellipsis, always end with period
  const words = unprotectTokens(targetProtected).split(/\s+/);
  let accum = "";
  for (const word of words) {
    const next = accum ? `${accum} ${word}` : word;
    if (next.length + 1 <= maxChars) {
      accum = next;
    } else {
      break;
    }
  }

  return cleanSentence(accum);
}

/**
 * Resolves the SEO description for a post:
 * 1. If a curated description from the spreadsheet exists for post.slug, uses it (strictly <= 118 chars).
 * 2. Otherwise runs summarizeForSeo on post.seo.metaDescription or post.excerpt, ensuring
 *    a clean, complete sentence under maxChars without cutting mid-sentence or adding "...".
 */
export function resolvePostSeoDescription(
  post: { slug?: string; seo?: { metaDescription?: string | null }; excerpt?: string | null },
  maxChars = 160
): string | undefined {
  if (post.slug && curatedDescriptions[post.slug]) {
    return curatedDescriptions[post.slug];
  }
  return summarizeForSeo(post.seo?.metaDescription || post.excerpt, maxChars);
}

export function buildArticleJsonLd(post: Post) {
  const url = post.seo.canonicalUrl || `${siteUrl()}/posts/${post.slug}`;
  const image = post.seo.ogImageUrl || post.coverImageUrl || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo.metaTitle || post.title,
    description: resolvePostSeoDescription(post),
    // A PDF post renders its pages as images, so the page carries no readable
    // body text. The extracted text is published here instead — it is the same
    // article the images show, which is what articleBody is for, and without it
    // the post would offer a crawler nothing beyond its title.
    articleBody: post.pdfUrl ? post.content || undefined : undefined,
    image,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    author: {
      "@type": "Organization",
      name: "MarketCatalyst",
      url: siteUrl(),
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl()}/#organization`,
      name: "MarketCatalyst",
      url: siteUrl(),
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl()}/#logo`,
        url: `${siteUrl()}/logo.png`,
      },
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteUrl()}/#website`,
      name: "MarketCatalyst",
      url: siteUrl(),
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
