import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validation/contact";
import { createSubmission } from "@/lib/contact/submissions";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/origin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "invalid_origin" }, { status: 403 });
  }

  const ip = getClientIp(request);

  // Per-IP burst limit plus a site-wide cap, so no single caller — or a
  // botnet spreading across many IPs — can flood the mailbox/Firestore.
  const [withinIpRate, withinGlobalRate] = await Promise.all([
    checkRateLimit(`contact-ip:${ip}`, 5, 600),
    checkRateLimit("contact-global", 100, 3600),
  ]);
  if (!withinIpRate || !withinGlobalRate) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  await createSubmission(parsed.data, {
    userAgent: request.headers.get("user-agent"),
    submittedFromPath: request.headers.get("referer"),
  });

  return NextResponse.json({ ok: true });
}
