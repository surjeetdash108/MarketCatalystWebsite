"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { GA4_ID, gtagConfig, gtagSrc } from "@/lib/analytics/ga";

/**
 * The Google tag (gtag.js) on every public page and blog post. The admin
 * console is skipped: staff traffic would pollute visitor analytics, and /admin
 * runs a nonce-based CSP these scripts do not carry (same as GoogleTagManager).
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <>
      <Script id="gtag-src" src={gtagSrc(GA4_ID)} strategy="afterInteractive" />
      <Script id="gtag-config" strategy="afterInteractive">
        {gtagConfig(GA4_ID)}
      </Script>
    </>
  );
}
