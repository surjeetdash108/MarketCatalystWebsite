// Font families for the marketing site.
//
// The site uses a unified typography pairing:
//   Space Grotesk: display, body, and UI headings
//   IBM Plex Mono: tickers, metrics, labels, numbers
//   Newsreader: italic editorial accents
//
// Self-hosted via next/font because the site CSP blocks external font stylesheets.
import { Space_Grotesk, IBM_Plex_Mono, Newsreader } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

// 400 is deliberately not loaded. At 400 the mono labels read thin and grey
// on the near-black ground; with no 400 face, CSS font matching resolves every
// 400 (and lighter) request to 500, so the whole site gets the medium cut
// without touching the ~150 rules and inline styles that set the family.
export const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

// Only italic is used on the site (.mc-serif, headline accents).
export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic"],
  display: "swap",
});

/** Combined className to apply on <html> so every --font-* variable is available. */
export const fontVariables = `${spaceGrotesk.variable} ${ibmPlexMono.variable} ${newsreader.variable}`;

