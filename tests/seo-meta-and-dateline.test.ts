// 16 Nov SEO report: #5 meta descriptions in the 120-155 range, #6 one publish time shown
// and marked up everywhere, #8 homepage og:url equal to the canonical.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { homeDocument } from "../lib/landing/home-document";
import { formatPublished } from "../lib/blog/published-time";
import { resolvePostSeoDescription } from "../lib/seo/jsonld";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

function pageDescription(file: string): string {
  const m = read(file).match(/description:\s*\n?\s*"([^"]+)"/);
  assert.ok(m, `${file} has no literal description`);
  return m[1];
}

test("static pages carry a 120-155 character description (legal pages were 34-36)", () => {
  for (const f of [
    "app/legal/privacy/page.tsx",
    "app/legal/terms/page.tsx",
    "app/contact/page.tsx",
    "app/careers/page.tsx",
    "app/faqs/page.tsx",
  ]) {
    const d = pageDescription(f);
    assert.ok(d.length >= 120 && d.length <= 155, `${f}: ${d.length} chars`);
  }
});

test("a post description is cut at 155, and filled from following sentences when the first is short", () => {
  const long = Array.from({ length: 8 }, (_, i) => `Sentence number ${i} says something about the market move today.`).join(" ");
  const d = resolvePostSeoDescription({ excerpt: long })!;
  assert.ok(d.length <= 155, String(d.length));
  assert.ok(d.length >= 120, String(d.length));
  assert.match(d, /\.$/);
});

test("homepage og:url is the canonical, trailing slash included", () => {
  const doc = homeDocument();
  const canonical = doc.match(/<link rel="canonical" href="([^"]+)">/)![1];
  const og = doc.match(/<meta property="og:url" content="([^"]+)">/)![1];
  assert.equal(og, canonical);
  assert.ok(og.endsWith("/"));
});

test("formatPublished gives one New York wording for a publish instant", () => {
  assert.equal(formatPublished("2026-11-14T15:30:00.000Z"), "November 14, 2026 · 10:30 ET");
  // late evening UTC is still the same New York day
  assert.equal(formatPublished("2026-11-15T02:05:00.000Z"), "November 14, 2026 · 21:05 ET");
  assert.equal(formatPublished(null), null);
  assert.equal(formatPublished("not a date"), null);
});

test("every post layout emits a <time datetime> from publishedAt", () => {
  const page = read("app/posts/[slug]/page.tsx");
  // the visible byline and the hidden dateline both use the shared formatter
  assert.equal((page.match(/<time\s/g) ?? []).length, 2);
  assert.equal((page.match(/dateTime=\{post\.publishedAt\}/g) ?? []).length, 2);
  assert.match(page, /formatPublished\(post\.publishedAt\)/);
  // the designed-HTML layout and the doc/own-headline layout both render it
  assert.match(page, /\{publishedDateline\}/);
  assert.match(page, /\(isDoc \|\| hasOwnHeadline\) && publishedDateline/);
});
