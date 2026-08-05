import type { Metadata } from "next";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/blog/posts";
import { PostBody } from "@/components/blog/PostBody";
import { buildArticleJsonLd } from "@/lib/seo/jsonld";

// Reading searchParams makes this dynamic (per-slug), so there is no ISR
// revalidate — each request resolves the post fresh from Firestore.

function firstParam(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string | string[] }>;
}): Promise<Metadata> {
  const slug = firstParam((await searchParams).slug);
  if (!slug) return {};
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  const title = post.seo.metaTitle || post.title;
  const description = post.seo.metaDescription || post.excerpt || undefined;
  const canonical = post.seo.canonicalUrl || `/posts/view?slug=${post.slug}`;
  const image = post.seo.ogImageUrl || post.coverImageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title,
      description,
      images: image ? [image] : undefined,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PostViewPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string | string[] }>;
}) {
  const slug = firstParam((await searchParams).slug);
  if (!slug) redirect("/posts");

  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = buildArticleJsonLd(post);

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {post.coverImageUrl && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded bg-neutral-100">
          <Image src={post.coverImageUrl} alt="" fill priority className="object-cover" />
        </div>
      )}
      <h1 className="mb-2 text-3xl font-semibold">{post.title}</h1>
      {post.publishedAt && (
        <time dateTime={post.publishedAt} className="text-sm text-neutral-400">
          {new Date(post.publishedAt).toLocaleDateString()}
        </time>
      )}
      <div className="mt-8">
        <PostBody markdown={post.content} />
      </div>
    </main>
  );
}
