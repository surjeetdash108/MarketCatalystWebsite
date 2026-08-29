import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getPublishedPostBySlug } from "@/lib/blog/posts";
import { PostBody } from "@/components/blog/PostBody";
import { PostPdf } from "@/components/blog/PostPdf";
import { PostDocx } from "@/components/blog/PostDocx";
import { PostHtmlDoc } from "@/components/blog/PostHtmlDoc";
import { getBlogTheme } from "@/lib/blog/theme";
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
  // Only an authored-HTML post uses the shared design; everything else is
  // drawn by the site's own article styling.
  const theme = post.format === "html" ? await getBlogTheme() : null;

  // A source-document post draws the file and suppresses the heading block; the
  // authored formats (text, html) print their own. Guarded on the URL as well
  // as the format so a doc post whose file is missing degrades to its body
  // rather than to a blank article.
  const isDoc = (post.format === "pdf" || post.format === "doc") && !!post.pdfUrl;

  return (
    // 1080, not the old 840: the width is set by what the article CARRIES, not
    // by its prose. A PDF or Word page and a designed html post both want the
    // room — they were being drawn into a column narrower than the page they
    // were made on. Prose keeps its own measure (.post-content below), so a
    // text post does not inherit line lengths nobody can read.
    <div className="flex flex-col gap-4" style={{ maxWidth: 1080, margin: "0 auto", padding: "28px 24px 80px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div>
        <Link href="/posts" className="btn sm">← Back to blogs</Link>
      </div>

      <article className="article">
        {post.coverImageUrl && post.format !== "html" && (
          <div className="article-hero">
            <Image src={post.coverImageUrl} alt="" fill priority sizes="760px" className="object-cover" />
          </div>
        )}
        {/* A source document opens with its own masthead, headline and date —
            so printing ours above it stated the same thing twice, in the
            importer's mangled words. The title still names the post everywhere
            it is referenced: the browser tab, the board, link previews and this
            page's JSON-LD. */}
        {!isDoc && post.format !== "html" && (
          <>
            <h1 className="article-title">{post.title}</h1>
            {post.excerpt && <p className="article-sub">{post.excerpt}</p>}
            {post.publishedAt && (
              <div className="article-meta">
                {/* Fixed to New York rather than the reader's zone: this page is
                    server-rendered and hydrated, and a zone-dependent string
                    differs between the two. The posts are about the US session,
                    so the closing bell is the useful reference either way. */}
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                    timeZone: "America/New_York",
                  })}
                  {" · "}
                  {new Date(post.publishedAt).toLocaleTimeString("en-GB", {
                    hour: "2-digit", minute: "2-digit", hour12: false,
                    timeZone: "America/New_York",
                  })}
                  {" ET"}
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
        {isDoc && post.excerpt && (
          <p className="post-doc-summary">{post.excerpt}</p>
        )}
        {isDoc && (
          post.sourceKind === "docx" ? (
            <PostDocx url={post.pdfUrl!} name={post.pdfName} slug={post.slug} />
          ) : (
            <PostPdf
              url={post.pdfUrl!}
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
        {!isDoc && (
          post.format === "html" && theme ? (
            // The whole article — masthead, hero and body — is drawn as the
            // approved template. Title, summary and hero come from the form,
            // not from the markup, so they cannot disagree with the post's
            // own metadata. See PostHtmlDoc.
            <PostHtmlDoc
              title={post.title}
              summary={post.excerpt}
              heroUrl={post.coverImageUrl}
              publishedAt={post.publishedAt ?? post.createdAt}
              html={post.content}
              theme={theme}
            />
          ) : (
            <div className="post-content">
              <PostBody markdown={post.content} />
            </div>
          )
        )}
      </article>
    </div>
  );
}
