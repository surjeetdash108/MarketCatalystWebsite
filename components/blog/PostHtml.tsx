import { sanitizeRichPostHtml } from "@/lib/security/sanitize";
import { scopePostCss } from "@/lib/blog/scope-css";

/**
 * An `html`-format post: authored markup rendered with the stylesheet it was
 * designed against.
 *
 * The two halves arrive separately — the admin service pulls `<style>` blocks
 * into the post's `css` field on write, because the body sanitizer does not
 * allow a `style` tag and would otherwise have deleted the design. Here they
 * are put back together: the CSS is scoped to this container so it can only
 * affect the article, and the markup goes through the wider allowlist that
 * keeps the structure and hooks the CSS selects on.
 *
 * Both passes run at render time, on every request, so a post written before a
 * rule existed is still subject to it.
 */
const SCOPE = "post-html";

export function PostHtml({ html, css }: { html: string; css: string[] }) {
  const body = sanitizeRichPostHtml(html);
  const styles = scopePostCss(css, `.${SCOPE}`);

  return (
    <div className={SCOPE}>
      {/* Rendered inside the article rather than hoisted: these rules belong to
          one post, and every selector in them is already prefixed with the
          container, so they carry no further than it. */}
      {styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null}
      {/* Safe: sanitizeRichPostHtml is an allowlist — no script, iframe, object,
          form, on* handler or non-http scheme survives it. */}
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </div>
  );
}
