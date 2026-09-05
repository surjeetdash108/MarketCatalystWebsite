import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedPostBySlug, getPublishedPosts } from "@/lib/blog/posts";
import { PostBody } from "@/components/blog/PostBody";
import { PostPdf } from "@/components/blog/PostPdf";
import { PostDocx } from "@/components/blog/PostDocx";
import { PostHtmlDoc } from "@/components/blog/PostHtmlDoc";
import { resolvePostDesign } from "@/lib/blog/post-design";
// The article's own baseline. Every rule is :where()-wrapped, so an uploaded
// design still wins — this only covers what that design does not mention.
import "../blog-doc.css";
import { buildArticleJsonLd } from "@/lib/seo/jsonld";

/**
 * Statically generated, one page per PUBLISHED post, revalidated on a timer.
 *
 * This route replaces /posts/view?slug=<slug>, which read searchParams and was
 * therefore dynamic by construction: every visit re-resolved the post from
 * Firestore, re-sanitized its markup and re-scoped its stylesheet, on a page
 * whose content changes only when an admin republishes it.
 *
 * Only the necessary pages are built: generateStaticParams lists published
 * posts and nothing else — no drafts, no other statuses. dynamicParams keeps a
 * post published between builds working, rendering it on first request and
 * caching it from then on.
 */
export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    // A build without Firestore credentials must not fail the whole build —
    // dynamicParams renders every post on demand instead.
    return [];
  }
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
  const canonical = post.seo.canonicalUrl || `/posts/${post.slug}`;
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

/**
 * The article's lead image, drawn identically on both branches below.
 *
 * A plain <img>, not next/image: covers are served from two different Storage
 * hosts (the tokenised firebasestorage.googleapis.com URLs the blog service
 * writes, and the public storage.googleapis.com ones the media library writes),
 * and the optimiser only accepts hosts named in next.config — a cover from the
 * other one rendered as a broken image rather than an unoptimised one.
 *
 * The box takes its height from the picture (capped) instead of forcing 16/9.
 * The covers are DESIGNED banners with words on them — the Palantir one is
 * 1245×456 — and cropping a 2.7:1 graphic to 16/9 cut its own headline off at
 * both ends. Only the empty state keeps a fixed ratio, since there is no
 * picture to take a shape from.
 */
function ArticleHero({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div className="article-hero article-hero-empty">
        <span>Image not available</span>
      </div>
    );
  }
  return (
    <div className="article-hero">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" />
    </div>
  );
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const jsonLd = buildArticleJsonLd(post);
  /* The design THIS post publishes with. Not the shared theme any more: that is
     one document the newest upload overwrites, so resolving every article
     through it meant publishing a second post silently restyled the first.
     resolvePostDesign returns the post's own stylesheet, recovering it from the
     stored document for posts that predate the field. */
  const design = await resolvePostDesign(post);

  // A source-document post draws the file and suppresses the heading block; the
  // authored formats (text, html) print their own. Guarded on the URL as well
  // as the format so a doc post whose file is missing degrades to its body
  // rather than to a blank article.
  const isDoc = (post.format === "pdf" || post.format === "doc") && !!post.pdfUrl;

  /* Does the authored document print a headline of its own? Only an <h1>
     counts: the designs put the article title there and use <h2>/<h3> for
     sections, so anything looser would read a section heading as the headline
     and suppress ours on a page that still has none. */
  const hasOwnHeadline = /<h1[\s>]/i.test(post.content);

  /* An authored-HTML post is a complete designed page, so it is given the page:
     full width, a white ground, and none of the site's own article furniture.
     Everything below this branch is the site DRAWING an article — card,
     masthead, hero, dateline, rule — which is right for prose and for a source
     document, and is a second competing page for a document that has its own. */
  if (post.format === "html" && design) {
    return (
      // Full-bleed and WHITE, not the shell's warm #f4f0e8: that cream is the
      // blog BOARD's palette, and it was showing through as the ground of a
      // designed page that expects to own its own background. The document
      // paints over this wherever its own stylesheet says to.
      <div style={{ background: "#ffffff", minHeight: "100vh", width: "100%" }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Both strips share .post-doc-back's measure so the link sits at the
            same left edge as the picture under it, rather than each carrying
            its own inline width. */}
        <div className="post-doc-back">
          <Link href="/posts" className="btn sm">← Back to blogs</Link>
        </div>
        <div className="post-doc-back post-doc-hero">
          <ArticleHero src={post.coverImageUrl} />
        </div>
        {/* The site normally stays out of an html post's way — the document
            draws its own headline, which is the whole point of the format. But
            a document that carries NO <h1> published as an untitled article:
            eyebrow, tag, date, then straight into the prose, with the headline
            existing only in the browser tab and on the board. When the document
            has nothing to say here, we say it. */}
        {!hasOwnHeadline && (
          <div className="post-doc-back post-doc-headline">
            <h1 className="article-title">{post.title}</h1>
            {post.excerpt && <p className="article-sub">{post.excerpt}</p>}
          </div>
        )}

        <PostHtmlDoc html={post.content} design={design} />
      </div>
    );
  }

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

      <div style={{ marginBottom: "16px" }}>
        <Link href="/posts" className="btn sm">← Back to blogs</Link>
      </div>

      <article className="article">
        <ArticleHero src={post.coverImageUrl} />
        {/* A source document opens with its own masthead, headline and date —
            so printing ours above it stated the same thing twice, in the
            importer's mangled words. The title still names the post everywhere
            it is referenced: the browser tab, the board, link previews and this
            page's JSON-LD. */}
        {/* Was `post.format !== "html"`, which assumed every html post is a
            designed page that prints its own headline. An html post only
            reaches this branch when it has NO design — plain prose typed into
            the console — and that assumption left it with no headline at all.
            Ask the markup instead of the format. */}
        {!isDoc && !hasOwnHeadline && (
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
        {/* html never reaches here — it returned above as its own document. */}
        {!isDoc && (
          <div className="post-content">
            <PostBody markdown={post.content} />
          </div>
        )}
      </article>
    </div>
  );
}
