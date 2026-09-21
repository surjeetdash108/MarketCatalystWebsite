// Font families for the marketing site.
//
// The design-token system in `app/iq.css` defines three CSS variables that
// every ported component and stylesheet rule actually reads:
//   --f-display -> var(--font-space-grotesk, 'Space Grotesk', sans-serif)
//   --f-body    -> var(--font-geist-sans,    'Inter', sans-serif)
//   --f-mono    -> var(--font-jetbrains-mono,'JetBrains Mono', monospace)
//
// `iq.css` also ships `.iq-root[data-font="..."]` overrides for Inter, DM
// Sans, Plus Jakarta Sans, IBM Plex Sans, Outfit and Manrope, but nothing in
// the ported marketing page (or this repo) ever sets a `data-font` attribute,
// so loading those extra families would just cost bytes with zero visual
// effect. Only the three families actually referenced are loaded here.
import { Space_Grotesk, Geist, JetBrains_Mono, Figtree, IBM_Plex_Mono, Newsreader } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

// Public blog board (/posts) uses Figtree to match the approved layout. Loaded
// via next/font so it is self-hosted from our own origin — the site CSP blocks
// external font stylesheets (fonts.googleapis.com), so a <link> would fail.
export const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  display: "swap",
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Landing page (app/page.tsx) type pairing: Space Grotesk for display/body,
// IBM Plex Mono for every ticker/label/figure, Newsreader italic for the
// editorial accents inside headlines. Self-hosted via next/font because the
// site CSP blocks external font stylesheets (fonts.googleapis.com).
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

export const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["italic", "normal"],
  display: "swap",
});

// Same trick as IBM Plex Mono above: no 400, so regular requests land on 500.
export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

/** Combined className to apply on <html> so every --font-* variable is available. */
export const fontVariables = `${spaceGrotesk.variable} ${geistSans.variable} ${jetbrainsMono.variable} ${figtree.variable} ${ibmPlexMono.variable} ${newsreader.variable}`;
