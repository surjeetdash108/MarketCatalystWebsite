// Google Tag Manager container ID (GTM-XXXXXXX), inlined at build time from
// NEXT_PUBLIC_GTM_ID in apphosting.yaml. GA4 and any other tags are configured
// inside the container, not here. Unset or malformed -> null, so nothing is
// loaded and tracking ships dark until the ID is provided.
//
// Shared by components/analytics/GoogleTagManager.tsx (every React page) and
// lib/landing/home-document.ts (the home page, which is a static document).
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();
export const GTM_VALID_ID = GTM_ID && /^GTM-[A-Z0-9]+$/.test(GTM_ID) ? GTM_ID : null;

/** Google's standard container bootstrap, for container `id`. */
export function gtmBootstrap(id: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`;
}

/** The <noscript> iframe URL GTM asks for as the first thing in <body>. */
export function gtmNoscriptSrc(id: string): string {
  return `https://www.googletagmanager.com/ns.html?id=${id}`;
}
