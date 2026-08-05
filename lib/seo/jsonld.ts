import type { Post } from "@/lib/blog/posts";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://marketcatalyst.ai";
}

export function buildArticleJsonLd(post: Post) {
  const url = post.seo.canonicalUrl || `${siteUrl()}/posts/view?slug=${post.slug}`;
  const image = post.seo.ogImageUrl || post.coverImageUrl || undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.seo.metaTitle || post.title,
    description: post.seo.metaDescription || post.excerpt || undefined,
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
