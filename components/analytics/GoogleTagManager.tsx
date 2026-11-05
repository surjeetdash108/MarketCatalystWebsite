"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { GTM_VALID_ID as VALID_ID, gtmBootstrap, gtmNoscriptSrc } from "@/lib/analytics/gtm";

// The container ID and snippet live in lib/analytics/gtm.ts (shared with the
// home page, which is a static document). Unset or malformed ID -> nothing is
// loaded, so this ships dark until NEXT_PUBLIC_GTM_ID is provided.

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
        {gtmBootstrap(VALID_ID)}
      </Script>
      <noscript>
        <iframe
          src={gtmNoscriptSrc(VALID_ID)}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
