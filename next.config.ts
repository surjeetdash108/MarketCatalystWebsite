import type { NextConfig } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteHost = siteUrl ? new URL(siteUrl).host : undefined;

const nextConfig: NextConfig = {
  // Don't advertise the framework in responses.
  poweredByHeader: false,

  // firebase-admin pulls in jose (ESM-only) via jwks-rsa, which breaks when
  // bundled for the server by Turbopack/webpack (`ERR_REQUIRE_ESM`). Keeping
  // it as a real external `require()` at runtime — rather than bundled —
  // avoids that; this only affects server-side bundling, never the client.
  // mammoth (.docx) and pdf-parse (.pdf, via pdfjs-dist) are heavy Node-only
  // parsers used by the blog document-import server action. Keep them as real
  // runtime `require()`s rather than bundling them for the server — pdfjs-dist
  // in particular pulls in worker/canvas code that breaks when bundled.
  serverExternalPackages: ["firebase-admin", "mammoth", "pdf-parse"],

  // Blog hero/cover images and media-library uploads are served from Cloud
  // Storage (made public per-object via file.makePublic() at upload time —
  // see lib/media/library.ts), not next/image's default same-origin
  // assumption.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }],
  },

  experimental: {
    serverActions: {
      // Pin to the exact prod hostname rather than leaving this wildcarded —
      // Server Actions already verify Origin/Referer against this list
      // automatically, which matters here since the admin panel is
      // cookie-authenticated (CSRF-relevant), unlike a bearer-token API.
      allowedOrigins: siteHost ? [siteHost] : undefined,
    },
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default nextConfig;
