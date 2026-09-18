/**
 * Matching and highlighting for the blog search — shared by the browser and
 * the API route so the two can never disagree about what counts as a hit.
 *
 * THE PROBLEM THIS SOLVES
 * A reader's most natural move is to copy a phrase off the page and paste it
 * into the search box. Done literally, that fails constantly:
 *
 *   - the page renders "AI’s" with a typographic apostrophe, the reader types
 *     "AI's" with a straight one (or the other way round);
 *   - copying across a line break, or out of our own quote strip, brings back
 *     a leading "…", a newline or a doubled space;
 *   - an em dash in the copy, a hyphen in the typing.
 *
 * Each of those is the same words to a human and a different string to
 * `indexOf`. So instead of comparing raw text we compare a FOLD of it, and we
 * match whitespace as a run rather than as a character.
 *
 * WHY THE FOLD IS ONE CHARACTER TO ONE CHARACTER
 * Highlighting needs to slice the ORIGINAL text — the reader must see the
 * article's own words lit up, not a normalised copy of them. Every rule here
 * therefore maps exactly one code point to exactly one code point, so an
 * offset found in the folded string is valid in the original.
 */

/**
 * Look-alikes, folded to the character a keyboard actually produces.
 *
 * In source order: the four single quotes (U+2018 U+2019 U+201A U+201B), prime
 * and acute and backtick; the five double quotes (U+201C U+201D U+201E U+201F
 * U+2033); the dash run U+2010..U+2015 plus minus U+2212; and the non-U+0020
 * spaces (NBSP, figure, thin, hair, narrow-NBSP, medium-math, ideographic).
 * They are written literally so the table reads as what it does — several are
 * invisible or near-identical on screen, hence the inventory above.
 */
const FOLD_MAP: Record<string, string> = {
  // apostrophes / single quotes -> '
  "‘": "'", "’": "'", "‚": "'", "‛": "'",
  "′": "'", "´": "'", "`": "'",
  // double quotes -> "
  "“": '"', "”": '"', "„": '"', "‟": '"', "″": '"',
  // dashes / minus -> -
  "‐": "-", "‑": "-", "‒": "-", "–": "-",
  "—": "-", "―": "-", "−": "-",
  // spaces that are not U+0020
  " ": " ", " ": " ", " ": " ", " ": " ",
  " ": " ", " ": " ", "　": " ",
};

const FOLD_RE =
  /[‘’‚‛′´`“”„‟″‐-―−      　]/g;

/** Fold look-alike characters. Length is preserved - see the note above. */
export function fold(text: string): string {
  return text.replace(FOLD_RE, (c) => FOLD_MAP[c] ?? c);
}

/** Regex metacharacters, so a query like "P/E (ttm)" is taken literally. */
const META = /[.*+?^${}()|[\]\\]/g;

/** A query longer than this is a paste accident, not a search. Capping it
 *  also caps the size of the pattern we compile. */
const MAX_QUERY = 200;

/**
 * Strip what a copy drags along: our own quote strip's ellipses, stray
 * whitespace, and the zero-width characters that ride out of rendered HTML.
 *
 * Single full stops are deliberately left alone — "vs." and "Inc." are words
 * a reader may well search for.
 */
export function normaliseQuery(raw: string): string {
  return fold(raw)
    .replace(/[​-‍﻿]/g, "")
    .replace(/^(?:\s|…|\.{3})+/, "")
    .replace(/(?:\s|…|\.{3})+$/, "")
    .trim()
    .slice(0, MAX_QUERY);
}

/**
 * Compile a query into a matcher, or null if there is nothing to look for.
 *
 * Whitespace in the query becomes `\s+`, so "price  floors", "price\nfloors"
 * and "price floors" are one search. The pattern is a chain of escaped
 * literals joined by `\s+`, which cannot backtrack pathologically.
 */
export function buildMatcher(rawQuery: string): RegExp | null {
  const q = normaliseQuery(rawQuery);
  if (!q) return null;
  const pattern = q
    .split(/\s+/)
    .map((word) => word.replace(META, "\\$&"))
    .join("\\s+");
  return new RegExp(pattern, "gi");
}

export type Range = { start: number; end: number };

/**
 * Every match in an ALREADY FOLDED string, as offsets usable against the
 * original. Callers that hold raw text should pass `fold(text)`; callers that
 * fold once and reuse (the API's index) pass their stored copy.
 */
export function findIn(folded: string, rx: RegExp): Range[] {
  const out: Range[] = [];
  rx.lastIndex = 0;
  for (let m = rx.exec(folded); m !== null; m = rx.exec(folded)) {
    if (m[0].length === 0) {
      rx.lastIndex++;
      continue;
    }
    out.push({ start: m.index, end: m.index + m[0].length });
  }
  return out;
}

/** Whether a folded string contains the query at all. */
export function testIn(folded: string, rx: RegExp): boolean {
  rx.lastIndex = 0;
  return rx.test(folded);
}

/** How many times the query occurs in a folded string. */
export function countIn(folded: string, rx: RegExp): number {
  let n = 0;
  rx.lastIndex = 0;
  for (let m = rx.exec(folded); m !== null; m = rx.exec(folded)) {
    if (m[0].length === 0) {
      rx.lastIndex++;
      continue;
    }
    n++;
  }
  return n;
}
