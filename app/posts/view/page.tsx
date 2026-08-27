import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/blog/posts";
import { PostBody } from "@/components/blog/PostBody";
import { PostPdf } from "@/components/blog/PostPdf";
import { PostDocx } from "@/components/blog/PostDocx";
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
    <div className="flex flex-col gap-4" style={{ maxWidth: 840, margin: "0 auto", padding: "28px 24px 80px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Link href="/posts" className="btn sm">← Back to blogs</Link>
      </div>

      <article className="article">
        {post.coverImageUrl && (
          <div className="article-hero">
            <Image src={post.coverImageUrl} alt="" fill priority sizes="760px" className="object-cover" />
          </div>
        )}
        {/* A source document opens with its own masthead, headline and date —
            so printing ours above it stated the same thing twice, in the
            importer's mangled words. The title still names the post everywhere
            it is referenced: the browser tab, the board, link previews and this
            page's JSON-LD. */}
        {!post.pdfUrl && (
          <>
            <h1 className="article-title">{post.title}</h1>
            {post.excerpt && <p className="article-sub">{post.excerpt}</p>}
            {post.publishedAt && (
              <div className="article-meta">
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                </time>
              </div>
            )}
            <hr className="article-rule" />
          </>
        )}
        {/* The summary DOES show above a source document — it is written for
            this spot (four standalone lines), unlike the heading block that was
            removed, which repeated the document's own title. Posts whose
            summary is empty, or is the importer's extracted-text noise, simply
            have nothing here. */}
        {post.pdfUrl && post.excerpt && (
          <p className="post-doc-summary">{post.excerpt}</p>
        )}
        {post.pdfUrl && (
          post.sourceKind === "docx" ? (
            <PostDocx url={post.pdfUrl} name={post.pdfName} slug={post.slug} />
          ) : (
            <PostPdf
              url={post.pdfUrl}
              name={post.pdfName}
              slug={post.slug}
              pages={post.pdfPages}
              aspect={post.pdfAspect}
            />
          )
        )}
        {/* On a PDF post the document IS the article, so the extracted text is
            not shown: it repeated the same report a second time, in a form the
            importer had already flattened — table rows broken into paragraphs,
            wrapped cells split across lines. It stays in the record and is
            still published as the article body in this page's JSON-LD, so
            search engines keep something to read. */}
        {!post.pdfUrl && (
          <div className="post-content">
            <PostBody markdown={post.content} />
          </div>
        )}
      </article>
    </div>
  );
}
