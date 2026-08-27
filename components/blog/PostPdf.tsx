"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The source PDF, rendered as the article itself.
 *
 * The research desk designs in PDF: its tables, KPI cards and layout exist only
 * in that file. The console's importer reads the text with pdf.js and groups it
 * by Y position, emitting one paragraph per visual line — a table row collapses
 * into a paragraph and a wrapped cell into the next — so the structure cannot
 * survive extraction. Embedding the original is the only way the page matches
 * what was published.
 *
 * The extracted text still renders below this, which is what search engines and
 * link previews read; the PDF is not a substitute for it.
 */

/** Letter portrait, used only when the file did not report its own shape. */
const FALLBACK_ASPECT = 11 / 8.5;
/** Gap the viewer leaves around each page, as a fraction of page height. */
const PAGE_GUTTER = 0.035;

export function PostPdf({
  url,
  name,
  pages,
  aspect,
}: {
  url: string;
  name: string | null;
  pages: number | null;
  aspect: number | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 820px)");
    const apply = () => setEmbed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Size the frame to the WHOLE document so the reader scrolls the page, not a
  // small box inside it. Height comes from the file's real page count and page
  // shape, captured at import — assuming Letter would cut A4 and landscape decks
  // short. Without a page count we cannot know the length, so that case keeps a
  // tall viewport and scrolls internally rather than guessing.
  useEffect(() => {
    if (!embed || !pages) return;
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (!w) return;
      const ratio = aspect && aspect > 0.2 && aspect < 5 ? aspect : FALLBACK_ASPECT;
      setHeight(Math.round(w * ratio * pages * (1 + PAGE_GUTTER)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [embed, pages, aspect]);

  // Chrome/Edge read these from the fragment and hide their viewer chrome, so
  // the document sits on the page as an article rather than inside an appliance
  // with its own toolbar and scrollbar. Other engines ignore them harmlessly.
  const src = `${url}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&view=FitH`;

  return (
    <section className="post-pdf" ref={wrapRef}>
      {embed ? (
        <>
          {/* <object> rather than <iframe>: it falls back to its children when
              the browser has no PDF viewer, so the fallback is not a dead end. */}
          <object
            className="post-pdf-frame"
            data={src}
            type="application/pdf"
            style={height ? { height } : undefined}
          >
            <p className="post-pdf-fallback">
              Your browser cannot display PDFs inline.{" "}
              <a href={url} target="_blank" rel="noopener noreferrer">Open the document</a>.
            </p>
          </object>
          <p className="post-pdf-foot">
            <a href={url} target="_blank" rel="noopener noreferrer">
              Open {name ?? "the PDF"} ↗
            </a>
          </p>
        </>
      ) : (
        // A Letter page in a ~380px viewport is unreadable — fixed width, no
        // reflow, pinch-zoom per paragraph. Small screens get the file and the
        // text version below instead of a viewer they would fight.
        <p className="post-pdf-fallback">
          The full document is best read on a larger screen.{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">Open the PDF</a>, or read the
          text version below.
        </p>
      )}
    </section>
  );
}
