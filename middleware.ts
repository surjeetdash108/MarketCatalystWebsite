import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

// Next.js middleware runs on the Edge runtime, which cannot load the
// Firebase Admin SDK (it needs Node's net/tls/crypto). So this layer can
// only do a cheap, fast-path check: is *a* session cookie present at all.
// It is NOT the authority on whether the caller is really authenticated or
// holds the right role — that full verification (verifySessionCookie via
// Admin SDK) happens in app/admin/layout.tsx (a Server Component, which
// runs in the Node.js runtime) and again independently in every Server
// Action via lib/auth/rbac.ts. Never treat this middleware check as
// sufficient on its own.
function hasSessionCookie(request: NextRequest): boolean {
  return Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);
}

const isDev = process.env.NODE_ENV !== "production";
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;

function buildCsp(nonce: string | null): string {
  // Dynamic routes (/admin) get a per-request nonce Next injects into every
  // script it emits. Static routes are prerendered at build time and can never
  // carry a per-request nonce, so there they fall back to 'unsafe-inline' —
  // which is what lets Next's own inline bootstrap + `__next_f` hydration
  // scripts run. A nonce with no matching scripts silently blocks them all and
  // breaks hydration site-wide (that was the carousel/WebGL "invisible" bug).
  const scriptInline = nonce ? `'nonce-${nonce}'` : "'unsafe-inline'";
  return [
    "default-src 'self'",
    // React/Turbopack's dev-mode HMR needs eval() for debugging features
    // (callstack reconstruction, fast refresh) — never allow this in
    // production. apis.google.com and gstatic.com are Firebase Auth's helper
    // scripts for signInWithPopup (Google provider) — admin login only.
    `script-src 'self' ${scriptInline} https://apis.google.com https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // blob: carries the rasterised PDF pages on research posts — pdf.js draws
    // each page to a canvas and hands it to an <img> as an encoded blob. Without
    // it those images are blocked and the article renders as blank paper.
    "img-src 'self' data: blob: https:",
    // signInWithPopup's actual relay iframe is served from the Firebase
    // project's own authDomain (__/auth/iframe), not accounts.google.com
    // directly — that's just where the top-level OAuth consent popup
    // navigates, which isn't subject to our frame-src at all (popups are
    // separate top-level browsing contexts, not iframes).
    `frame-src${firebaseAuthDomain ? ` https://${firebaseAuthDomain}` : ""}`,
    // Research posts used to hand their PDF to the browser's plugin, which
    // needed Storage allowed as an object/frame source. They now rasterise the
    // pages themselves, so no plugin is involved and this can stay shut.
    "object-src 'none'",
    // pdf.js does its parsing and rasterising in a worker loaded from /public.
    // Named explicitly because worker-src otherwise falls back to default-src,
    // and pdf.js also constructs a blob worker on some fallback paths.
    "worker-src 'self' blob:",
    // Dev-mode HMR also needs a WebSocket connection back to the local dev
    // server, which production never opens.
    `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://apis.google.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasSessionCookie(request)) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Only the dynamically-rendered /admin area can receive a per-request nonce
  // (Next reads it from the `Content-Security-Policy` REQUEST header and stamps
  // it onto its <script> tags). Public marketing pages are statically
  // prerendered, so they use the 'unsafe-inline' fallback instead — see
  // buildCsp. Applying the nonce CSP to those static pages blocked their own
  // inline hydration scripts and silently killed every client component.
  const isAdmin = request.nextUrl.pathname.startsWith("/admin");
  const requestHeaders = new Headers(request.headers);
  let csp: string;
  if (isAdmin) {
    const nonce = crypto.randomUUID();
    requestHeaders.set("x-csp-nonce", nonce);
    csp = buildCsp(nonce);
    requestHeaders.set("Content-Security-Policy", csp);
  } else {
    csp = buildCsp(null);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
