"use client";

import { useEffect, useState } from "react";

/**
 * The source PDF, shown as the primary reading experience.
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
 *
 * Mobile deliberately gets the download button instead of the viewer. A Letter
 * page in a ~380px viewport is unreadable — fixed width, no reflow, pinch-zoom
 * per paragraph — so small screens fall through to the text version and can
 * open the file if they want it.
 */
export function PostPdf({ url, name }: { url: string; name: string | null }) {
  const [embed, setEmbed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 820px)");
    const apply = () => setEmbed(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <section className="post-pdf">
      <div className="post-pdf-bar">
        <span className="post-pdf-label">
          Published document{name ? ` · ${name}` : ""}
        </span>
        <a className="post-pdf-dl" href={url} target="_blank" rel="noopener noreferrer">
          Open PDF ↗
        </a>
      </div>

      {embed ? (
        // <object> rather than <iframe>: it degrades to its children when the
        // browser has no PDF viewer, so the fallback link is not a dead end.
        <object className="post-pdf-frame" data={url} type="application/pdf">
          <p className="post-pdf-fallback">
            Your browser cannot display PDFs inline.{" "}
            <a href={url} target="_blank" rel="noopener noreferrer">Open the document</a>.
          </p>
        </object>
      ) : (
        <p className="post-pdf-fallback">
          The full document is best read on a larger screen.{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">Open the PDF</a>, or read the
          text version below.
        </p>
      )}
    </section>
  );
}
