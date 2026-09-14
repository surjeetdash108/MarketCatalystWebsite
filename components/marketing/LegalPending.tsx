import Link from "next/link";

/**
 * The shell a legal document lives in before its text exists.
 *
 * These two routes were linked from the footer of every public page while
 * returning 404 (flagged in the 2026-08-16 QA log, confirmed twice). A 404 is
 * the worst of the options: the reader cannot tell whether the document is
 * missing, moved, or the site is broken.
 *
 * What it deliberately does NOT do is stand in for the document. No invented
 * clauses, no "last updated" date, no language that could be read as binding —
 * a financial product's terms have legal force, and placeholder text presented
 * as real terms would be worse than the 404 it replaces. It states plainly that
 * the document is being prepared and gives a way to ask for it.
 *
 * TO PUBLISH THE REAL DOCUMENT: replace the <LegalPending> element in
 * app/legal/terms/page.tsx (or .../privacy/page.tsx) with the approved copy and
 * set a real effective date. Nothing else here needs to change.
 */
export function LegalPending({
  title,
  summary,
}: {
  title: string;
  summary: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="a-h1">{title}</h1>
        <p className="a-muted" style={{ marginTop: 6 }}>{summary}</p>
      </div>

      <div className="a-panel" style={{ padding: 28 }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0 0 10px", color: "var(--text-hi)" }}>
          This document is being prepared
        </h2>
        <p style={{ margin: "0 0 14px", lineHeight: 1.7 }}>
          The final text has not been published yet. Rather than show you
          placeholder wording that could be mistaken for the real thing, we would
          rather say so directly.
        </p>
        <p style={{ margin: "0 0 14px", lineHeight: 1.7 }}>
          If you need this document before it is published — for a compliance
          review, a procurement process, or your own records — please{" "}
          <Link href="/contact" style={{ color: "var(--brand-2, #3b63e8)", textDecoration: "underline" }}>
            get in touch
          </Link>{" "}
          and we will send you the current position in writing.
        </p>
        <p className="a-muted" style={{ margin: 0, fontSize: ".88rem", lineHeight: 1.6 }}>
          MarketCatalyst provides market data and research tools for information
          purposes. It is not investment advice, and nothing on this site is a
          recommendation to buy or sell any security.
        </p>
      </div>
    </div>
  );
}
