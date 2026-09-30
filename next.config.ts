import type { NextConfig } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const siteHost = siteUrl ? new URL(siteUrl).host : undefined;

const nextConfig: NextConfig = {
  // Don't advertise the framework in responses.
  poweredByHeader: false,

  // Stamped once per build, so the sitemap can give the authored pages (home,
  // about, features, legal...) a lastmod that moves when a deploy ships and
  // stays put between deploys, rather than on every server cold start.
  env: {
    BUILD_TIME: new Date().toISOString(),
  },

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
    remotePatterns: [
      { protocol: "https", hostname: "storage.googleapis.com" },
      // The blogs admin uploads through the Firebase Storage download API and
      // stores THAT url (see storeSourceDoc / externalizeImages in the backend).
      // Without this host an uploaded hero image renders as a broken image, and
      // next/image throws rather than falling back.
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
    ],
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

  // Blog posts published more than once. The backend de-duplicates a repeated
  // title by suffixing -2, -3..., so re-uploading an article creates a second
  // live copy competing with the first in search. Each copy 301s to the
  // original; the copies should also be unpublished in the blog admin. Add
  // future duplicates here as [copy slug, original slug].
  async redirects() {
    const duplicatePosts: [string, string][] = [
      ["inside-the-hack-where-openai-s-own-ai-agents-went-rogue-2", "inside-the-hack-where-openai-s-own-ai-agents-went-rogue"],
      ["inside-the-hack-where-openai-s-own-ai-agents-went-rogue-3", "inside-the-hack-where-openai-s-own-ai-agents-went-rogue"],
    ];
    return duplicatePosts.map(([copy, original]) => ({
      source: `/posts/${copy}`,
      destination: `/posts/${original}`,
      statusCode: 301 as const,
    }));
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
