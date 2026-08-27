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
