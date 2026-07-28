"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

// Required by @sentry/nextjs for the App Router: without an explicit
// global-error boundary, Sentry's instrumentation of Next's auto-generated
// one breaks prerendering of the special /_global-error page entirely.
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
