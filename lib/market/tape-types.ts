/**
 * The live-tape payload, shared by the server reader and the client that
 * renders it.
 *
 * Kept apart from lib/market/tape.ts because that file is `server-only`: the
 * hero's HUD and the marquee are client components and need these shapes, but
 * must never pull the SSE reader — or the backend origin — into the browser
 * bundle.
 */

export type LiveCell = {
  /** Matches the static HUD key in components/home/data.ts so the client can
   *  overlay live figures onto the designed cells by name. */
  k: string;
  v: string;
  chg: string;
  arrow: string;
  tone: "up" | "down";
  /** Bar fill, derived from the size of the move. */
  w: string;
  note: string;
};

export type LiveQuote = { sym: string; chg: string; tone: "up" | "down" };

export type LiveTape = {
  asOf: string;
  /** "open" | "pre" | "after" | "closed" | "unknown" */
  phase: string;
  stale: boolean;
  delayNote: string;
  /** The hero HUD's four cells. */
  cells: LiveCell[];
  /** The marquee's quotes. */
  quotes: LiveQuote[];
  /** One sentence over the four cells, generated — never editorial. */
  read: string;
};
