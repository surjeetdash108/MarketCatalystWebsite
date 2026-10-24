import { ImageResponse } from "next/og";
import { getCachedPostSummaries, getPublishedPostBySlug } from "@/lib/blog/posts";
import { sectionOfType } from "@/lib/blog/sections";

/**
 * A 1200x630 link-preview card for one post: section, headline, date, brand.
 *
 * Posts without a cover image used to share /og-image.jpg, so every share on X,
 * LinkedIn or Slack looked identical and Discover had no unique image to use.
 * generateMetadata and the article's JSON-LD point here for those posts.
 *
 * A route handler rather than the `opengraph-image` file convention on purpose:
 * that convention overrides the metadata's own `images`, which would replace a
 * real cover image with this card on the posts that have one.
 */
export const dynamic = "force-dynamic";

const WIDTH = 1200;
const HEIGHT = 630;

/** Headline size by length, so a 94-character title and a 30-character one both fill the card. */
function headlineSize(chars: number): number {
  if (chars <= 50) return 72;
  if (chars <= 80) return 62;
  if (chars <= 110) return 54;
  return 46;
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // The cached list first (no Firestore read). A post published in the last few
  // minutes is not in it yet, and a social crawler arrives within seconds of a
  // post going out, so fall back to a direct read rather than 404 its preview.
  let post: { title: string; type: string; publishedAt: string | null; createdAt: string } | undefined;
  try {
    post = (await getCachedPostSummaries()).find((p) => p.slug === slug);
    post ??= (await getPublishedPostBySlug(slug)) ?? undefined;
  } catch {
    post = undefined;
  }
  if (!post) return new Response("Not found", { status: 404 });

  const title = clip(post.title, 130);
  const section = sectionOfType(post.type);
  const date = new Date(post.publishedAt ?? post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/New_York",
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #07080A 0%, #0E1612 100%)",
          color: "#F4F6F5",
          fontFamily: "Geist, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 18, height: 18, borderRadius: 9, background: "#4ADE80", display: "flex" }} />
            <div style={{ fontSize: 26, letterSpacing: 6, color: "#F4F6F5", display: "flex" }}>MARKETCATALYST</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#4ADE80",
              border: "2px solid #4ADE80",
              borderRadius: 999,
              padding: "8px 22px",
            }}
          >
            {section}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: headlineSize(title.length),
            lineHeight: 1.12,
            fontWeight: 700,
            letterSpacing: -1.5,
            maxHeight: 360,
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 26, color: "#9AA3A0" }}>
          <div style={{ display: "flex" }}>{date}</div>
          <div style={{ display: "flex", color: "#4ADE80" }}>marketcatalyst.ai</div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        // Social crawlers cache these themselves; a day at the CDN keeps a viral
        // post from re-rendering its card on every share.
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
