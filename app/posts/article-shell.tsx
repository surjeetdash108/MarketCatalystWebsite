"use client";

import { SiteNav } from "@/components/chrome/SiteNav";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { useEtClock, useScrollChrome } from "@/components/chrome/chrome-hooks";

/**
 * The chrome an article page sits in: the site's own surface, nav and footer.
 *
 * It used to carry a private header built from the ADMIN console's stylesheet,
 * with two hand-written palettes (a neutral white, and a warm #14110e dark
 * from the old blog board) mapped onto admin.css variable names. That made the
 * public article the only page on the site not drawn from app/theme.css, and
 * it drifted every time the palette moved. Now it is the same shell as
 * everywhere else, so the background, the nav and the light/dark toggle are
 * the landing page's, by construction rather than by copying values across.
 *
 * What is deliberately NOT touched is the article itself. The document keeps
 * its own structure and its own stylesheet (blog-doc.css, plus whatever CSS
 * the uploaded post carries), which is entirely self-contained: every token it
 * uses is declared on `.mc-doc` and switched by a `[data-theme="dark"]`
 * ancestor. `.mc-page` below is that ancestor, so the post follows the
 * reader's choice exactly as it did before — the chrome changed, the
 * typesetting did not.
 */
function PostsShell({ children }: { children: React.ReactNode }) {
  // The nav's scrolled state and the footer's ET clock; the same two hooks the
  // board and the reading pages use.
  useScrollChrome();
  useEtClock();

  return (
    /* Locked to the light palette, deliberately.

       An article page is a ground for someone else's document, and those
       documents are light by construction: blog-doc.css gives .mc-doc a white
       surface and a near-black --doc-ink with no dark counterpart, and the
       uploaded post designs are drawn on white. The shell this replaces
       hardcoded `light` too and never rendered a toggle on this route, so light
       is the only state these documents have ever been rendered in.

       It cannot be solved by nesting a light scope inside a dark page either:
       `[data-theme="dark"] .something` matches on ANY ancestor, so a post's own
       dark rules still fire from the page wrapper however close a light scope
       sits — and with arbitrary uploaded CSS there is no reliable way to
       out-specify that. Locking the route is the honest fix; supporting dark
       means giving the documents real dark blocks, which is a separate job.

       What DOES come from the site's design is everything around the document:
       this is .mc-page on app/theme.css tokens with the landing page's nav and
       footer, instead of the old private header built from the admin console's
       stylesheet. */
    <div className="mc-page" data-theme="light">
      <div className="mc-prog" aria-hidden="true">
        <i id="mc-prog-bar" />
      </div>

      {/* No toggle: it would promise a dark article the documents cannot honour. */}
      <SiteNav active="blogs" />

      {/* Padded because the site nav is position:fixed, where the old article
          header sat in flow and reserved the space itself. */}
      <main className="mc-article">{children}</main>

      <SiteFooter />
    </div>
  );
}

export default function ArticleShellLayout({ children }: { children: React.ReactNode }) {
  return <PostsShell>{children}</PostsShell>;
}
