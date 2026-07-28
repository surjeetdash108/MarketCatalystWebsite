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

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    // React/Turbopack's dev-mode HMR needs eval() for debugging features
    // (callstack reconstruction, fast refresh) — never allow this in
    // production, where the nonce alone is sufficient. apis.google.com and
    // gstatic.com are Firebase Auth's helper scripts for signInWithPopup
    // (Google provider) — needed in both dev and prod, admin login only.
    `script-src 'self' 'nonce-${nonce}' https://apis.google.com https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    // signInWithPopup's actual relay iframe is served from the Firebase
    // project's own authDomain (__/auth/iframe), not accounts.google.com
    // directly — that's just where the top-level OAuth consent popup
    // navigates, which isn't subject to our frame-src at all (popups are
    // separate top-level browsing contexts, not iframes).
    `frame-src${firebaseAuthDomain ? ` https://${firebaseAuthDomain}` : ""}`,
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

  const nonce = crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-csp-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", buildCsp(nonce));
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
