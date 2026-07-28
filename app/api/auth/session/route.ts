import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { getMember } from "@/lib/auth/members";
import { SESSION_COOKIE_NAME, SESSION_EXPIRES_IN_MS } from "@/lib/auth/constants";
import { isSameOriginRequest } from "@/lib/security/origin";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";

// Firebase Admin SDK cannot run on the Edge runtime — explicit so a future
// refactor never silently targets Edge and breaks auth in a confusing way.
export const runtime = "nodejs";

const AUTH_TIME_MAX_AGE_SECONDS = 5 * 60;

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const ip = getClientIp(request);
  const withinRate = await checkRateLimit(`auth-session:${ip}`, 10, 3600);
  if (!withinRate) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const idToken = typeof body?.idToken === "string" ? body.idToken : null;
  if (!idToken) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Reject stale ID tokens outright to reduce the replay window for a
  // token obtained some other way than a fresh interactive sign-in.
  const authTimeAgeSeconds = Date.now() / 1000 - decoded.auth_time;
  if (authTimeAgeSeconds > AUTH_TIME_MAX_AGE_SECONDS) {
    return NextResponse.json({ error: "stale_token" }, { status: 401 });
  }

  // A signed-in trading-app customer (or anyone else without a
  // website_members doc) must get a clean rejection here — never a
  // valid-but-unauthorized session cookie. Firestore membership, not any
  // custom claim, is the sole authorization source.
  const member = await getMember(decoded.uid);
  if (!member) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });
  return response;
}
