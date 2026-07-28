import "server-only";

// Next.js Server Actions already verify Origin/Referer automatically
// (see next.config.ts experimental.serverActions.allowedOrigins), but plain
// Route Handlers do not get that check — app/api/auth/session and
// app/api/contact must verify it themselves, since this app is
// cookie-authenticated and therefore CSRF-relevant (unlike the existing
// bearer-token-only NestJS backend, which has no cookies to forge).
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  // Same-origin browser navigations/fetches always send Origin for
  // state-changing requests; absence of the header is treated as untrusted
  // rather than assumed to be a same-origin server-to-server call.
  if (!origin) return false;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return false;

  try {
    return new URL(origin).origin === new URL(siteUrl).origin;
  } catch {
    return false;
  }
}
