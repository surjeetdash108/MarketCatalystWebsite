import Script from "next/script";
import { sanitizeRichPostHtml } from "@/lib/security/sanitize";
import { scopeCss } from "@/lib/blog/scope-css";
import { buildToc } from "@/lib/blog/toc";
import { ShareRail } from "./ShareRail";
import { TocSpy } from "./TocSpy";
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
 *
 * Three things are derived PER POST, not authored: the keyword chips (from the
 * post's tags/categories), the share rail, and the "On this page" nav — the
 * last built from whatever <h2> sections the article actually contains, so it is
 * dynamic and correct for every blog with no per-post work. See buildToc.
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
  tags,
  categories,
}: {
  title: string;
  summary: string;
  heroUrl: string | null;
  publishedAt: string | null;
  html: string;
  theme: BlogTheme;
  tags?: string[];
  categories?: string[];
}) {
  const sanitized = sanitizeRichPostHtml(html);
  // Give each <h2> a stable id and collect the section list for the nav.
  const { html: body, toc } = buildToc(sanitized);

  // Keyword chips — the post's own tags/categories, deduped and capped.
  const chips = Array.from(
    new Set([...(categories ?? []), ...(tags ?? [])].map((s) => s.trim()).filter(Boolean)),
  ).slice(0, 6);

  // The nav is only worth its column when there are a couple of sections.
  const hasToc = toc.length >= 2;

  /**
   * The stored design is written as a whole page would be — `body { … }`,
   * `h2 { … }`, `a { … }` — because that is what an uploaded document
   * contains. Applied as-is it would restyle the site around the article, so
   * every selector is prefixed with the article's own container first, and
   * `body`/`:root` map onto that container. See scopeCss.
   */
  const themeCss = scopeCss(theme.css.join("\n"), ".mc-doc");

  return (
    <div className="mc-doc">
      {/* The shared stylesheet. Rendered inside the article rather than hoisted
          to <head> because it belongs to this page only, and `</style` is
          stripped so a stylesheet cannot close its own tag and open markup. */}
      {themeCss && (
        <style
          dangerouslySetInnerHTML={{ __html: themeCss.replace(/<\/?(style|script)/gi, "") }}
        />
      )}

      {/* Tailwind, from our own origin. The uploaded design loads it from a CDN;
          serving our own copy renders the same page without a third-party
          script on our domain, and without loosening the CSP to allow one.
          afterInteractive so the markup is in the DOM when it scans for
          classes — it compiles what it finds. */}
      <Script src="/blog-tailwind.js" strategy="afterInteractive" />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 22px 64px" }}>
        <header className="art-head">
          <div className="mc-badge">MarketCatalyst</div>
          <h1>{title}</h1>
          {summary && <p className="dek">{summary}</p>}
          {chips.length > 0 && (
            <div className="chips">
              {chips.map((c) => (
                <span className="chip" key={c}>{c}</span>
              ))}
            </div>
          )}
          {publishedAt && (
            <div className="meta">
              Daily Market Recap
              <span className="sep" />
              {fmtDate(publishedAt)}
              <span className="sep" />
              Published after the 4:00 p.m. ET close
            </div>
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

        {/* [ share rail | article | on-this-page ] — collapses to one column on
            smaller screens (see .mc-doc .layout in blog-doc.css). */}
        <div className={hasToc ? "layout" : "layout no-toc"}>
          <ShareRail title={title} />

          <article>
            {/* Safe: sanitizeRichPostHtml is an allowlist — no script, iframe,
                object, form, on* handler or non-http scheme survives it. */}
            <div className="post-body" id="postBody" dangerouslySetInnerHTML={{ __html: body }} />
          </article>

          {hasToc && (
            <aside className="toc" aria-label="On this page">
              <h4>On this page</h4>
              <ol>
                {toc.map((t) => (
                  <li key={t.id}>
                    <a href={`#${t.id}`}>{t.text}</a>
                  </li>
                ))}
              </ol>
            </aside>
          )}
        </div>
      </div>

      {/* Client-only: highlights the current section in the nav while scrolling. */}
      <TocSpy />
    </div>
  );
}
