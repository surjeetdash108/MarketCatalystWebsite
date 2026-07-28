import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/blog/posts";
import { PostBody } from "@/components/blog/PostBody";
import { buildArticleJsonLd } from "@/lib/seo/jsonld";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  const title = post.seo.metaTitle || post.title;
  const description = post.seo.metaDescription || post.excerpt || undefined;
  const canonical = post.seo.canonicalUrl || `/blog/${post.slug}`;
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
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
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
