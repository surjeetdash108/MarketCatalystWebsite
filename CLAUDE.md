# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The public marketing site, blog/research CMS, and admin console for MarketCatalyst — a Next.js 16 (App Router) app deployed to Firebase App Hosting. It is one of three repos sharing the `market-catalyst-502415` Firebase/GCP project:

- **This repo** — public marketing pages, `/posts` blog, `/admin` CMS, contact form. No authenticated end-user features live here.
- **MarketCatalystBackEnd** — the NestJS API (bearer-token auth) that the actual trading app talks to, and that writes blog posts to Firestore.
- **MarketCatalystUI** — the trading app itself (separate Firebase Hosting static site).

Firestore is shared with the backend: production reads/writes the named database `mc-regional` (not `(default)`), set via `FIRESTORE_DATABASE_ID` in [apphosting.yaml](apphosting.yaml). If this ever drifts from the backend's setting, published posts silently stop appearing.

## Commands

```bash
npm run dev              # next dev
npm run build             # runs prebuild (copies pdf.js worker + fonts into /public/pdfjs) then next build
npm run lint               # eslint
npm run seed:admin         # tsx scripts/seed-admin.ts — the ONLY way to create an ADMIN member (see RBAC below)
npm run seed:faqs          # tsx scripts/seed-faqs.ts
npm run seed:blogs         # tsx scripts/seed-blogs.ts
npm run clear:blogs        # tsx scripts/clear-blogs.ts
npm run blogs:strip-chrome # tsx --env-file=.env scripts/strip-post-chrome.ts
```

There is no test suite/framework configured in this repo — do not assume Jest/Vitest exist.

`npm run build` fails without network access to fetch pdf.js assets via the `prebuild` script; that script must succeed before `next build` runs (`serverExternalPackages` in [next.config.ts](next.config.ts) also keeps `firebase-admin`, `mammoth`, and `pdf-parse` as real runtime `require()`s rather than bundled, since they break under Turbopack/webpack bundling).

Firebase App Hosting does **not** read `.env` files and does not honor `--set-secrets` — every env var the app needs at runtime must be declared in [apphosting.yaml](apphosting.yaml), with true secrets provisioned via Secret Manager (`firebase apphosting:secrets:set`) rather than committed.

## Architecture

### Auth & RBAC (defense in depth, three independent layers)

1. **[middleware.ts](middleware.ts)** (Edge runtime) — cheapest possible check: is *a* session cookie present at all. Cannot load `firebase-admin` (needs Node's net/tls/crypto), so it cannot verify the cookie. Also builds the CSP header (see below) and 308-redirects the legacy `/posts/view?slug=` route to `/posts/<slug>`.
2. **`app/admin/layout.tsx`** (Server Component, Node runtime) — real verification via `getSessionUser()`.
3. **Every Server Action / Route Handler mutation** — calls [`requireEditorOrAdmin()` or `requireAdmin()`](lib/auth/rbac.ts) as its first line. This is not optional/defensive: a route added outside the middleware matcher, or a future refactor that disables it, must not silently become writable.

[`getSessionUser()`](lib/auth/session.ts) is the single source of truth for "who is this". It treats identity and authorization as separate facts: a valid Firebase session cookie only proves *who*; the `website_members` Firestore doc (looked up by uid) decides *whether they have any admin-UI access at all*, and their role (`ADMIN` | `EDITOR`, see [lib/auth/constants.ts](lib/auth/constants.ts)). A valid session for a uid with no `website_members` doc is treated identically to no session.

There is deliberately no in-app action that grants `ADMIN` — the only path is `scripts/seed-admin.ts`, run locally by someone with direct Firestore access.

Client-side Firebase SDK ([lib/firebase/client.ts](lib/firebase/client.ts)) is used **only** by `app/admin/login`. Every other page — the entire public marketing/blog surface — reads/writes exclusively through Server Actions/Route Handlers using `firebase-admin` ([lib/firebase/admin.ts](lib/firebase/admin.ts)). Never introduce a client-side Firestore read on a public page.

### CSP / middleware nonce split

`/admin` is dynamically rendered per-request, so middleware stamps a fresh nonce (`crypto.randomUUID()`) into the CSP and Next injects it into every script tag it emits there. Static marketing pages are prerendered at build time and can never carry a per-request nonce, so they fall back to `'unsafe-inline'` in the CSP instead. **Do not apply the nonce CSP to static routes** — it silently blocks Next's own inline hydration bootstrap (`__next_f`) and breaks every client component on the page with no visible error (this already happened once, described in the middleware source as "the carousel/WebGL invisible bug").

### Blog/posts content model

The public route is `/posts` (blog board) → `/posts/[slug]` (article). `/blog` and `/posts/view?slug=` are permanent redirects kept for old links/SEO equity only — never build new features against them.

A [`Post`](lib/blog/posts.ts) has a `format` of `"html" | "text" | "pdf" | "doc"`:
- `pdf`/`doc` — the research desk authors in native PDF/Word; the uploaded file *is* the article. It's rasterized (pdf) or rendered (docx) client-side rather than shown via a browser plugin, specifically so CSP can stay locked to `'self'` (see [scripts/copy-pdf-worker.mjs](scripts/copy-pdf-worker.mjs) and `object-src 'none'` in middleware).
- `html` — a fully designed document (its own `<style>`, own headline). Rendered full-bleed with none of the site's article chrome.
- `text` — prose typed into the admin console; rendered inside the site's own article shell (`blog-doc.css`).

**Each `html`-format post carries its own stylesheet** (`post.css`, `post.documentHtml`), resolved per-post by [`resolvePostDesign()`](lib/blog/post-design.ts) — this is not incidental, it fixes a real bug where a single shared "theme" document meant every new HTML upload silently reskinned *every previously published* post that happened to share a class name. When touching post rendering/design resolution, preserve the per-post resolution order (post's own `css` → recovered from `documentHtml` → shared theme, but only if the shared theme actually matches classes used in *this* post's markup).

HTML sanitization ([lib/security/sanitize.ts](lib/security/sanitize.ts)) runs twice — at write time and again at render time immediately before `dangerouslySetInnerHTML` — as defense in depth against a compromised editor account. There are two allowlists: a narrow one for markdown-derived prose (`sanitizePostHtml`) and a much wider one for authored `html`-format documents (`sanitizeRichPostHtml`, permits structural/SVG/inert-control tags but still blocks `script`/`iframe`/`on*`/non-http(s) schemes). Extending either allowlist is a security-sensitive change — read the inline rationale in that file before adding tags/attributes.

### Security posture elsewhere

- [lib/security/rate-limit.ts](lib/security/rate-limit.ts) — Firestore-transaction-backed (not in-memory: App Hosting runs multiple instances), keys are salted+hashed (`RATE_LIMIT_SALT`), never store raw IPs.
- [lib/security/origin.ts](lib/security/origin.ts) — manual Origin/Referer check for plain Route Handlers (Server Actions already get this from `experimental.serverActions.allowedOrigins` in [next.config.ts](next.config.ts); Route Handlers don't, and this app is cookie-authenticated so CSRF is in-scope).
- [lib/security/validate-image.ts](lib/security/validate-image.ts) — validates uploads to the media library.

### Market tape (landing page live data)

[lib/market/tape.ts](lib/market/tape.ts) fetches a single unauthenticated SSE endpoint on a separate public Cloud Run backend, server-side only, with a short TTL cache and a hard timeout — the landing page must render its static designed numbers immediately and never block on this. Every other market data surface requires a Firebase ID token and belongs to the trading app, not this marketing site.

### Deployment

Firebase App Hosting, config in [apphosting.yaml](apphosting.yaml). `minInstances: 0` — cold starts are expected. Sentry ([instrumentation.ts](instrumentation.ts), [instrumentation-client.ts](instrumentation-client.ts), `sentry.*.config.ts`) is wired but currently has no DSN configured (no-ops until one is added); App Hosting's yaml validator rejects an env entry with an empty string value, which is why the Sentry vars are commented out rather than blank.
