import type { Metadata } from "next";
import Link from "next/link";
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
    <div className="flex flex-col gap-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Link href="/posts" className="btn sm">← All blogs</Link>
      </div>

      <article className="a-panel" style={{ padding: 24 }}>
        {post.coverImageUrl && (
          <div className="relative mb-5 aspect-video w-full overflow-hidden rounded" style={{ background: "var(--surface-0)" }}>
            <Image src={post.coverImageUrl} alt="" fill priority className="object-cover" />
          </div>
        )}
        <h1 className="a-h1" style={{ fontSize: "1.7rem", lineHeight: 1.25 }}>{post.title}</h1>
        {post.publishedAt && (
          <time dateTime={post.publishedAt} className="a-muted" style={{ display: "block", marginTop: 6 }}>
            {new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
          </time>
        )}
        <div style={{ marginTop: 20 }}>
          <PostBody markdown={post.content} />
        </div>
      </article>
    </div>
  );
}
