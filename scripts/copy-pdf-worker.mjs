import { copyFile, cp, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

/**
 * Publishes pdf.js's runtime assets to /public so they load from our origin.
 *
 * Two things have to be fetchable by URL:
 *
 *  - **The worker.** pdf.js parses and rasterises off the main thread, and the
 *    worker script is loaded by URL. A CDN would mean widening script-src and
 *    putting page rendering behind a third party; a node_modules path does not
 *    survive the build. Copying keeps the CSP at 'self'.
 *
 *  - **The standard fonts.** A PDF may use the base-14 faces (Helvetica,
 *    Times, Symbol…) without embedding them — the research-desk exports do
 *    exactly this. pdf.js then needs its own substitutes, and without them the
 *    page rasterises with the text missing or boxed. That failure looks like a
 *    broken document, not a missing asset, so this is not optional.
 *
 * Runs as `prebuild`, so both always match the installed pdfjs-dist rather than
 * a stale copy committed by hand — a worker/API version mismatch makes pdf.js
 * refuse to load the document at all.
 */

const require = createRequire(import.meta.url);
const pkgRoot = dirname(require.resolve("pdfjs-dist/package.json"));
const destDir = join(process.cwd(), "public", "pdfjs");

await mkdir(destDir, { recursive: true });

await copyFile(
  join(pkgRoot, "build", "pdf.worker.min.mjs"),
  join(destDir, "pdf.worker.min.mjs"),
);
await cp(join(pkgRoot, "standard_fonts"), join(destDir, "standard_fonts"), {
  recursive: true,
});

console.log(`[copy-pdf-worker] worker + standard_fonts -> ${destDir}`);
