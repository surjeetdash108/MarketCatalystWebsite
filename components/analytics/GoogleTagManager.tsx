"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Google Tag Manager container ID (GTM-XXXXXXX), inlined at build time from
// NEXT_PUBLIC_GTM_ID in apphosting.yaml. GA4 and any other tags are configured
// inside the container, not here. Unset or malformed -> nothing is loaded, so
// this ships dark until the ID is provided.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();
const VALID_ID = GTM_ID && /^GTM-[A-Z0-9]+$/.test(GTM_ID) ? GTM_ID : null;

/**
 * Loads GTM on the public site. The admin console is skipped: staff traffic
 * would pollute visitor analytics, and /admin runs a nonce-based CSP that this
 * script does not carry. The domains GTM and GA4 need are allowed in the CSP in
 * middleware.ts.
 */
export function GoogleTagManager() {
  const pathname = usePathname();
  if (!VALID_ID || pathname?.startsWith("/admin")) return null;

  return (
    <>
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${VALID_ID}');`}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${VALID_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
