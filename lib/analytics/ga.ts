// Google tag (gtag.js) for GA4 property G-QJNNB0JLS0 — the snippet Google gives
// for "every page", loaded on every public page and blog post:
//   React pages        → components/analytics/GoogleAnalytics.tsx (root layout)
//   static home page   → lib/landing/home-document.ts
// The hosts it needs (googletagmanager.com, *.google-analytics.com) are already
// allowed by the CSP in middleware.ts.
export const GA4_ID = "G-QJNNB0JLS0";

/** The gtag.js loader URL for a measurement ID. */
export function gtagSrc(id: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${id}`;
}

/** Google's inline config snippet for a measurement ID. */
export function gtagConfig(id: string): string {
  return `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

gtag('config', '${id}');`;
}
