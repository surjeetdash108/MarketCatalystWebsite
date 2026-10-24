import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validation/contact";
import { createSubmission } from "@/lib/contact/submissions";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { isSameOriginRequest } from "@/lib/security/origin";

export const runtime = "nodejs";

// Every failure answers with its own status and `error` code
// (invalid_origin 403, rate_limited 429, invalid_input 400, server_error 500)
// so the form can tell the visitor what actually went wrong.
export async function POST(request: Request) {
  try {
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
      // The schema's own messages are written for the visitor ("Enter a valid
      // email address"), so the first one is passed through for the form.
      return NextResponse.json(
        { error: "invalid_input", message: parsed.error.issues[0]?.message },
        { status: 400 },
      );
    }

    await createSubmission(parsed.data, {
      userAgent: request.headers.get("user-agent"),
      submittedFromPath: request.headers.get("referer"),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
