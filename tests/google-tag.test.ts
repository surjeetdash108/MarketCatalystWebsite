// Google tag (gtag.js, G-QJNNB0JLS0) on every page and blog post: React pages
// (posts, blog, features, …) through the root layout, the static home page
// through its document builder. /admin is skipped (staff traffic).
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { GA4_ID, gtagSrc, gtagConfig } from "../lib/analytics/ga";
import { homeDocument } from "../lib/landing/home-document";

const read = (f: string) => fs.readFileSync(path.join(process.cwd(), f), "utf8");

test("the tag is the one supplied", () => {
  assert.equal(GA4_ID, "G-QJNNB0JLS0");
  assert.equal(gtagSrc(GA4_ID), "https://www.googletagmanager.com/gtag/js?id=G-QJNNB0JLS0");
  const cfg = gtagConfig(GA4_ID);
  assert.match(cfg, /window\.dataLayer = window\.dataLayer \|\| \[\];/);
  assert.match(cfg, /function gtag\(\)\{dataLayer\.push\(arguments\);\}/);
  assert.match(cfg, /gtag\('js', new Date\(\)\);/);
  assert.match(cfg, /gtag\('config', 'G-QJNNB0JLS0'\);/);
});

test("every React page (posts, blog, …) loads it from the root layout, not on /admin", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /import \{ GoogleAnalytics \} from "@\/components\/analytics\/GoogleAnalytics";/);
  assert.match(layout, /<GoogleAnalytics \/>/);
  const comp = read("components/analytics/GoogleAnalytics.tsx");
  assert.match(comp, /<Script id="gtag-src" src=\{gtagSrc\(GA4_ID\)\} strategy="afterInteractive" \/>/);
  assert.match(comp, /<Script id="gtag-config" strategy="afterInteractive">/);
  assert.match(comp, /pathname\?\.startsWith\("\/admin"\)/);
});

test("the static home page carries it in <head>", () => {
  const doc = homeDocument();
  const head = doc.slice(0, doc.indexOf("</head>"));
  assert.ok(head.includes(`<script async src="https://www.googletagmanager.com/gtag/js?id=G-QJNNB0JLS0"></script>`));
  assert.ok(head.includes("gtag('config', 'G-QJNNB0JLS0');"));
});

test("the CSP allows gtag.js and its hits", () => {
  const mw = read("middleware.ts");
  assert.match(mw, /script-src[^`]*https:\/\/www\.googletagmanager\.com/);
  assert.match(mw, /connect-src[^`]*https:\/\/\*\.google-analytics\.com/);
});
