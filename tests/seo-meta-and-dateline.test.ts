// 16 Nov SEO report: #5 meta descriptions in the 120-155 range, #6 one publish time shown
// and marked up everywhere, #8 homepage og:url equal to the canonical.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { homeDocument } from "../lib/landing/home-document";
import { applyDateline, formatPublished, publishedLine, readMinutes } from "../lib/blog/published-time";
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

test("formatPublished gives one New York wording for a publish instant (B-24)", () => {
  assert.equal(formatPublished("2026-11-14T15:30:00.000Z"), "Nov 14, 2026 · 10:30 AM ET");
  // late evening UTC is still the same New York day
  assert.equal(formatPublished("2026-11-15T02:05:00.000Z"), "Nov 14, 2026 · 9:05 PM ET");
  assert.equal(formatPublished(null), null);
  assert.equal(formatPublished("not a date"), null);
});

test("a post's own date line is rewritten from publishedAt, in every wording seen live (B-07, B-08, B-24)", () => {
  const line = publishedLine("2026-11-23T15:24:44.000Z", 3)!;
  assert.equal(line, "Published Nov 23, 2026 · 10:24 AM ET · 3 min read");
  for (const own of [
    "Published Nov 23, 2026 · 10:30 AM ET",
    "Published Nov. 17, 2026 · 2:30 p.m. ET · 2 min read",
    "18 Nov 2026 · 10:15 ET",
    "Published Wednesday, November 25, 2026 · 11:30 AM ET · 3 min read",
    "Nov 11, 2026 · 9:44 PM ET",
    "4 min read",
  ]) {
    const r = applyDateline(`<style>x</style><div class="meta"><span>${own}</span></div><h2>Body</h2><p>Nov 1, 2026 · 9:00 AM ET</p>`, line);
    assert.ok(r.found, own);
    assert.equal(r.html, `<style>x</style><div class="meta"><span>${line}</span></div><h2>Body</h2><p>Nov 1, 2026 · 9:00 AM ET</p>`);
  }
  assert.equal(applyDateline("<h1>T</h1><p>No date here.</p>", line).found, false);
});

test("listing and page count read time the same way, without markup (B-09)", () => {
  const html = `<style>.a{b:c}</style><p>${"word ".repeat(600)}</p>`;
  assert.equal(readMinutes(html), 3);
  assert.match(read("app/posts/page.tsx"), /readMin: readMinutes\(p\.content\)/);
  assert.match(read("app/posts/[slug]/page.tsx"), /publishedLine\(post\.publishedAt, readMinutes\(post\.content\)\)/);
});

test("every post layout emits a <time datetime> from publishedAt", () => {
  const page = read("app/posts/[slug]/page.tsx");
  // the dateline (hidden when the post prints its own line, visible when not) and the prose byline
  assert.equal((page.match(/<time\s/g) ?? []).length, 3);
  assert.equal((page.match(/dateTime=\{post\.publishedAt\}/g) ?? []).length, 3);
  assert.match(page, /formatPublished\(post\.publishedAt\)/);
  // the designed-HTML layout and the doc/own-headline layout both render it
  assert.match(page, /\{publishedDateline\}/);
  assert.match(page, /\(isDoc \|\| hasOwnHeadline\) && publishedDateline/);
});

test("listing cards show the post's own label beside its section (B-10)", () => {
  const page = read("app/posts/page.tsx");
  assert.match(page, /topic: topicLabel\(p\.categories, sectionOfType\(p\.type\)\)/);
  const board = read("components/blog/BlogIndex.tsx");
  assert.equal((board.match(/<TopicTag topic=/g) ?? []).length, 2);
});
