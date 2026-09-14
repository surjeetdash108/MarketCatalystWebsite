"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The source Word document, rendered as the article itself.
 *
 * Same reasoning as the PDF path (see PostPdf): the desk designs in the
 * document, so its tables, images and layout only exist there, and the
 * importer's text extraction flattens all of it. The difference is how the
 * pages are produced — a .docx is OOXML, not a page description, so there is
 * nothing to rasterise. docx-preview walks the markup and builds real DOM,
 * which is better than an image would be: the text stays selectable,
 * searchable and readable by a screen reader.
 *
 * Word's own running headers and footers are switched off, and its page cards
 * are flattened by CSS, so the result reads as one continuous document rather
 * than a stack of paper — matching what the PDF path does by cropping.
 */

/**
 * Word draws list bullets as characters from the Symbol and Wingdings fonts,
 * addressed in the private-use area — a plain bullet is U+F0B7 in Symbol.
 * Those fonts are a Windows installation detail, not web fonts, so every one
 * of them lands in a browser as a blank box, once per bullet, right down the
 * article. docx-preview reproduces the codepoint faithfully; there is nothing
 * for it to do about the missing font.
 *
 * Each is mapped to the real Unicode character Word was drawing.
 */
const SYMBOL_BULLETS: Record<string, string> = {
  "": "•",
  "": "●",
  "": "▪",
  "": "▫",
  "": "➢",
  "": "✓",
  "": "○",
  "": "◆",
};

/**
 * Rewrites the bullet rules docx-preview injects. It emits list markers as
 * generated `content`, so the substitution happens in its stylesheets rather
 * than the document text — and the Symbol/Wingdings request has to go with
 * them, or the browser would send the replacements straight back to blank
 * boxes. Numbered lists use CSS counters and are left alone.
 */
function normalizeWordBullets(host: HTMLElement): void {
  host.querySelectorAll("style").forEach((el) => {
    const before = el.textContent ?? "";
    let css = before;
    for (const [pua, real] of Object.entries(SYMBOL_BULLETS)) {
      css = css.split(pua).join(real);
      // The same codepoint can arrive CSS-escaped rather than literal.
      css = css.split(`\\${pua.codePointAt(0)!.toString(16)}`).join(real);
    }
    css = css.replace(/font-family:\s*(Symbol|Wingdings[^;]*|Webdings)\s*;/gi, "");
    if (css !== before) el.textContent = css;
  });
}

export function PostDocx({
  url,
  name,
  slug,
}: {
  url: string;
  name: string | null;
  slug: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return;

    (async () => {
      try {
        const { renderAsync } = await import("docx-preview");
        // Same-origin proxy: a direct Storage fetch is cross-origin and the
        // bucket sends no CORS headers. See app/api/post-pdf/route.ts.
        const res = await fetch(`/api/post-pdf?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) throw new Error(`source ${res.status}`);
        const blob = await res.blob();
        if (cancelled) return;

        await renderAsync(blob, host, undefined, {
          className: "docx",
          inWrapper: true,
          // Word lays out for a fixed paper width; the article column is
          // narrower and responsive, so let our layout win.
          ignoreWidth: true,
          ignoreHeight: true,
          // One flowing document, not a run of page cards with gaps between.
          breakPages: false,
          ignoreLastRenderedPageBreak: true,
          // The site header already says whose page this is; the document's
          // own running header/footer is the same duplication the PDF path
          // crops away.
          renderHeaders: false,
          renderFooters: false,
          experimental: true,
          useBase64URL: true,
        });
        if (cancelled) return;
        normalizeWordBullets(host);
        setState("ready");
      } catch {
        if (!cancelled) setState("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <section className="post-doc">
      {/* Above the document, for the same reason as the PDF path: the pages run
          for several screens and a link below them is only found by scrolling
          past everything. */}
      <p className="post-pdf-foot">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Download {name ?? "the document"} ↓
        </a>
      </p>
      {state === "failed" ? (
        <p className="post-pdf-fallback">
          The document could not be displayed here.{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">Open it</a> instead.
        </p>
      ) : (
        // Height is unknown until it renders — a Word file carries no page
        // count — so this reserves a screen rather than guessing a length.
        <div
          ref={hostRef}
          className="post-doc-host"
          style={state === "loading" ? { minHeight: "70vh" } : undefined}
        />
      )}
    </section>
  );
}
