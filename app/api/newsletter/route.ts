import { NextResponse } from "next/server";
import { newsletterSignupSchema } from "@/lib/validation/newsletter";
import { subscribe } from "@/lib/newsletter/subscribers";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/origin";

export const runtime = "nodejs";

/**
 * POST /api/newsletter — the "Get the recap" signup on /posts. Stores the
 * address in Firestore (newsletterSubscribers). It used to open a mailto:
 * link, which silently did nothing for anyone without a desktop mail app
 * while the button still said "Request sent".
 */
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const ip = getClientIp(request);
  // Per-IP burst limit plus a site-wide cap, same as the contact form.
  const [withinIpRate, withinGlobalRate] = await Promise.all([
    checkRateLimit(`newsletter-ip:${ip}`, 5, 600),
    checkRateLimit("newsletter-global", 300, 3600),
  ]);
  if (!withinIpRate || !withinGlobalRate) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = newsletterSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { created } = await subscribe(parsed.data.email, {
    source: parsed.data.source ?? null,
    userAgent: request.headers.get("user-agent"),
    submittedFromPath: request.headers.get("referer"),
  });

  return NextResponse.json({ ok: true, created });
}
