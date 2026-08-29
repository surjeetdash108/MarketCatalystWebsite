import Script from "next/script";
import { sanitizeRichPostHtml } from "@/lib/security/sanitize";
import type { BlogTheme } from "@/lib/blog/theme";

/**
 * An authored HTML post, drawn as the approved recap template.
 *
 * The admin writes only what sits inside <body>. The masthead above it — the
 * kicker, the headline, the standfirst and the dateline — is built HERE from
 * the form fields, so those three are entered once and are the same on the
 * article, the board card and the page metadata. An admin cannot accidentally
 * publish a post whose headline disagrees with its title.
 *
 * The design comes from the shared theme rather than the post, so every article
 * looks the same and a design change lands everywhere at once.
 */

const ET = "America/New_York";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric", timeZone: ET,
  });

export function PostHtmlDoc({
  title,
  summary,
  heroUrl,
  publishedAt,
  html,
  theme,
}: {
  title: string;
  summary: string;
  heroUrl: string | null;
  publishedAt: string | null;
  html: string;
  theme: BlogTheme;
}) {
  const body = sanitizeRichPostHtml(html);

  return (
    <div className="mc-doc">
      {/* The shared stylesheet. Rendered inside the article rather than hoisted
          to <head> because it belongs to this page only, and `</style` is
          stripped so a stylesheet cannot close its own tag and open markup. */}
      {theme.css.length > 0 && (
        <style
          dangerouslySetInnerHTML={{
            __html: theme.css.join("\n").replace(/<\/?(style|script)/gi, ""),
          }}
        />
      )}

      {/* Tailwind, from our own origin. The uploaded design loads it from a CDN;
          serving our own copy renders the same page without a third-party
          script on our domain, and without loosening the CSP to allow one.
          afterInteractive so the markup is in the DOM when it scans for
          classes — it compiles what it finds. */}
      <Script src="/blog-tailwind.js" strategy="afterInteractive" />

      <div className="max-w-[800px] mx-auto px-5 py-10 md:py-14">
        <header className="mb-10">
          <div className="mc-badge mb-4">MarketCatalyst</div>
          <h1 className="text-3xl md:text-[2.6rem] font-extrabold leading-tight mb-4">{title}</h1>
          {summary && (
            <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-3">{summary}</p>
          )}
          {publishedAt && (
            <p className="text-sm text-gray-500">
              Daily Market Recap &middot; {fmtDate(publishedAt)} &middot; Published after the 4:00 p.m. ET close
            </p>
          )}
        </header>

        {heroUrl && (
          <div className="image-container">
            {/* Plain <img>: covers are served from two Storage hosts and
                next/image throws on an unconfigured one, which would take the
                whole article down rather than degrade. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroUrl} alt="" />
          </div>
        )}

        {/* Safe: sanitizeRichPostHtml is an allowlist — no script, iframe,
            object, form, on* handler or non-http scheme survives it. */}
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </div>
    </div>
  );
}
