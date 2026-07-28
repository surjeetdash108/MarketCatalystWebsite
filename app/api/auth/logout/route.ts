import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { getSessionUser } from "@/lib/auth/session";
import { isSameOriginRequest } from "@/lib/security/origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const user = await getSessionUser();
  if (user) {
    // Invalidates any other outstanding session/ID tokens for this user too,
    // not just the cookie being cleared here.
    await adminAuth.revokeRefreshTokens(user.uid).catch(() => undefined);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete({ name: SESSION_COOKIE_NAME, path: "/admin" });
  return response;
}
