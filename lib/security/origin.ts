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

  // Same-origin by definition: the page that sent the request is on the very
  // host the request was addressed to. A cross-site attacker cannot forge the
  // browser's Origin, so this is a sound CSRF check — and it holds on every
  // host the site is served from (www and bare domain, any local dev port)
  // without depending on NEXT_PUBLIC_SITE_URL being set to exactly that host.
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host");
  try {
    if (host && new URL(origin).host === host) return true;
  } catch {
    return false;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return false;

  try {
    const site = new URL(siteUrl);
    const from = new URL(origin);
    if (from.origin === site.origin) return true;
    // The site is served on both the bare domain and www. (www does not
    // redirect), so a form posted from www.marketcatalyst.ai is just as
    // same-site as one from marketcatalyst.ai. Same scheme and port only.
    const bare = (h: string) => h.replace(/^www\./, "");
    return (
      from.protocol === site.protocol &&
      from.port === site.port &&
      bare(from.hostname) === bare(site.hostname)
    );
  } catch {
    return false;
  }
}
