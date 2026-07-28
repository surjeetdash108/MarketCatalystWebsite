import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0,
  // Full errors go to Sentry only — Route Handlers/Server Actions return
  // generic messages to the client (see lib/auth/rbac.ts, app/api/**).
});
