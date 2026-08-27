"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { furnitureCrop, type FurnitureCrop, type PdfPageText } from "@/lib/blog/pdf-furniture";

/**
 * The source PDF, rendered as the article itself.
 *
 * The research desk designs in PDF: its tables, KPI cards and layout exist only
 * in that file. The console's importer reads the text with pdf.js and groups it
 * by Y position, emitting one paragraph per visual line — a table row collapses
 * into a paragraph and a wrapped cell into the next — so the structure cannot
 * survive extraction. Showing the original is the only way the page matches
 * what was published.
 *
 * We draw the pages ourselves instead of handing the file to the browser's PDF
 * viewer. That viewer is a separate process: its dark page gutters and toolbar
 * cannot be styled from here at any price, and it always paints the whole page
 * including the running header/footer. Rasterising each page to an image is
 * what makes a seamless, furniture-free article possible — and it is also what
 * makes the document readable on a phone, which the embedded viewer never was.
 *
 * The extracted text still renders below this, which is what search engines and
 * link previews read; the images are not a substitute for it.
 */

/** Letter portrait, used only to reserve space before the file is parsed. */
const FALLBACK_ASPECT = 11 / 8.5;

/** Rasterised pages are capped here however wide the column or dense the screen. */
const MAX_RENDER_WIDTH = 2400;

/** Render width is quantised to this, so a drag-resize cannot thrash the worker. */
const WIDTH_STEP = 200;

type LoadedDoc = {
  doc: PDFDocumentProxy;
  crop: FurnitureCrop;
  /** Page box in points, before cropping. */
  pageWidth: number;
  pageHeight: number;
};

export function PostPdf({
  url,
  name,
  slug,
  pages,
  aspect,
}: {
  url: string;
  name: string | null;
  slug: string;
  pages: number | null;
  aspect: number | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState<LoadedDoc | null>(null);
  const [failed, setFailed] = useState(false);
  const [renderWidth, setRenderWidth] = useState(0);

  // Grow-only, quantised: widening the window re-rasterises once at the new
  // size, narrowing it just scales the images down, and neither churns.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => {
      if (!el.clientWidth) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const needed = el.clientWidth * dpr;
      setRenderWidth((prev) =>
        needed > prev * 1.15
          ? Math.min(Math.ceil(needed / WIDTH_STEP) * WIDTH_STEP, MAX_RENDER_WIDTH)
          : prev,
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    // The teardown lives on the loading task, not the document — destroying it
    // is what shuts the worker down.
    let task: { destroy: () => Promise<void> } | null = null;

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Both are served from our own origin — see scripts/copy-pdf-worker.mjs.
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";

        const loading = pdfjs.getDocument({
          // Same-origin proxy: a direct Storage fetch is cross-origin and the
          // bucket sends no CORS headers. See app/api/post-pdf/route.ts.
          url: `/api/post-pdf?slug=${encodeURIComponent(slug)}`,
          // The desk's exports use the base-14 faces without embedding them;
          // without these the text does not draw at all.
          standardFontDataUrl: "/pdfjs/standard_fonts/",
        });
        task = loading;
        const doc: PDFDocumentProxy = await loading.promise;
        if (cancelled) return;

        const first = await doc.getPage(1);
        const box = first.getViewport({ scale: 1 });

        // Text positions are read in unrotated page space, so a rotated page
        // would put the crop on the wrong edge. Rather than guess, such a
        // document renders uncropped.
        let rotated = false;
        const pageTexts: PdfPageText[] = [];
        for (let n = 1; n <= doc.numPages; n++) {
          const page = await doc.getPage(n);
          if (page.rotate % 360 !== 0) rotated = true;
          const view = page.getViewport({ scale: 1 });
          const text = await page.getTextContent();
          pageTexts.push({
            height: view.height,
            items: text.items.flatMap((item) =>
              "str" in item
                ? [{
                    str: item.str,
                    y: item.transform[5],
                    height: item.height || Math.abs(item.transform[3]),
                  }]
                : [],
            ),
          });
        }
        if (cancelled) return;

        setLoaded({
          doc,
          crop: rotated ? { top: 0, bottom: 0 } : furnitureCrop(pageTexts),
          pageWidth: box.width,
          pageHeight: box.height,
        });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      // Tears down the worker; without it every navigation leaks one.
      void task?.destroy();
    };
  }, [slug]);

  // Space is reserved from the stored page count and shape so the text below
  // does not jump once the pages rasterise.
  const placeholderAspect = aspect && aspect > 0.2 && aspect < 5 ? aspect : FALLBACK_ASPECT;

  return (
    <section className="post-pdf" ref={wrapRef}>
      {loaded && renderWidth > 0 ? (
        <div className="post-pdf-pages">
          {Array.from({ length: loaded.doc.numPages }, (_, i) => (
            <PdfPage
              key={i + 1}
              doc={loaded.doc}
              pageNumber={i + 1}
              crop={loaded.crop}
              pageWidth={loaded.pageWidth}
              pageHeight={loaded.pageHeight}
              renderWidth={renderWidth}
            />
          ))}
        </div>
      ) : failed ? (
        <p className="post-pdf-fallback">
          The document could not be displayed here.{" "}
          <a href={url} target="_blank" rel="noopener noreferrer">Open the PDF</a>, or read the
          text version below.
        </p>
      ) : (
        <div
          className="post-pdf-loading"
          style={pages ? { aspectRatio: `1 / ${placeholderAspect * pages}` } : undefined}
        />
      )}
      <p className="post-pdf-foot">
        <a href={url} target="_blank" rel="noopener noreferrer">
          Open {name ?? "the PDF"} ↗
        </a>
      </p>
    </section>
  );
}

/**
 * One rasterised page.
 *
 * Drawn only as it nears the viewport, and handed straight to an <img> as a
 * compressed blob: holding eight full-size canvases would cost ~100 MB of
 * bitmap, while the encoded images cost a couple of hundred KB each.
 */
function PdfPage({
  doc,
  pageNumber,
  crop,
  pageWidth,
  pageHeight,
  renderWidth,
}: {
  doc: PDFDocumentProxy;
  pageNumber: number;
  crop: FurnitureCrop;
  pageWidth: number;
  pageHeight: number;
  renderWidth: number;
}) {
  const holderRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [src, setSrc] = useState<string | null>(null);

  const visibleHeight = pageHeight - crop.top - crop.bottom;

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      // Start a screen early so scrolling meets a drawn page, not a blank one.
      { rootMargin: "1000px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    let cancelled = false;
    let objectUrl: string | null = null;

    (async () => {
      try {
        const page = await doc.getPage(pageNumber);
        const scale = renderWidth / pageWidth;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(visibleHeight * scale);

        // The viewport maps the bottom of the page to the bottom of the canvas,
        // so a short canvas drops the footer band on its own. The top band has
        // to be shifted off deliberately.
        await page.render({
          canvas,
          viewport,
          transform: crop.top ? [1, 0, 0, 1, 0, -crop.top * scale] : undefined,
          // Pages are transparent where nothing is drawn; without this they
          // composite onto the page background instead of paper.
          background: "#ffffff",
        }).promise;
        if (cancelled) return;

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/webp", 0.92),
        );
        // Release the bitmap as soon as it is encoded.
        canvas.width = 0;
        canvas.height = 0;
        if (cancelled || !blob) return;

        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch {
        // A page that will not draw is left blank rather than taking the
        // article down; the "Open the PDF" link below still works.
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [near, doc, pageNumber, renderWidth, pageWidth, visibleHeight, crop.top]);

  return (
    <div
      ref={holderRef}
      className="post-pdf-page"
      style={{ aspectRatio: `${pageWidth} / ${visibleHeight}` }}
    >
      {/* Rasterised page, not a photograph — next/image would add a loader and
          a second network hop for a blob that is already in memory. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt={`Page ${pageNumber}`} draggable={false} />}
    </div>
  );
}
