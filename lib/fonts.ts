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
import { Space_Grotesk, Geist, JetBrains_Mono } from "next/font/google";

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Combined className to apply on <html> so every --font-* variable is available. */
export const fontVariables = `${spaceGrotesk.variable} ${geistSans.variable} ${jetbrainsMono.variable}`;
