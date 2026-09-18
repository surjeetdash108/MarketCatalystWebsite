import { findIn, fold } from "@/lib/blog/search-match";

/* ── Search highlighting ──────────────────────────────────────────────────
   Whatever the reader typed is painted, in place, everywhere it occurs —
   a blog headline, a standfirst, a line quoted out of an article, an FAQ
   question or its answer.

   The matching itself lives in lib/blog/search-match.ts, shared with the API
   route, so "this matched" and "here is where" are always the same judgement.
   It is tolerant by design: curly quotes, em dashes, doubled spaces and a
   stray leading ellipsis all fold away, because the reader's most natural
   move is to copy a phrase off the page and paste it back in.             */

type Part = { t: string; hit: boolean };

/**
 * Split `text` into alternating plain / matched runs.
 *
 * The matcher runs over a FOLDED copy, but every offset it returns indexes the
 * original — so what comes back out is the source's own words, casing and
 * punctuation intact, merely lit up.
 */
export function splitHits(text: string, rx: RegExp | null): Part[] {
  if (!rx || !text) return [{ t: text || "", hit: false }];
  const ranges = findIn(fold(text), rx);
  if (ranges.length === 0) return [{ t: text, hit: false }];

  const out: Part[] = [];
  let i = 0;
  for (const r of ranges) {
    if (r.start > i) out.push({ t: text.slice(i, r.start), hit: false });
    out.push({ t: text.slice(r.start, r.end), hit: true });
    i = r.end;
  }
  if (i < text.length) out.push({ t: text.slice(i), hit: false });
  return out;
}

/** `text` with every occurrence of the query wrapped in the highlight. */
export function Marked({ text, rx }: { text: string; rx: RegExp | null }) {
  if (!rx) return <>{text}</>;
  return (
    <>
      {splitHits(text, rx).map((part, i) =>
        part.hit ? (
          <mark className="mc-hit" key={i}>
            {part.t}
          </mark>
        ) : (
          <span key={i}>{part.t}</span>
        ),
      )}
    </>
  );
}
