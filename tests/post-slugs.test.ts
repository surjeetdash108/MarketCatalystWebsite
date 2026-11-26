import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { backendSlugCut, movedSlugCandidates } from "../lib/blog/moved-slugs";
import { SHORTENED_POSTS } from "../lib/seo/shortened-posts";

// Shapes from the 26 Nov audit's Broken Link Map: [linked full-length slug, live slug].
const BROKEN_LINK_SHAPES: [string, string][] = [
  [
    "nasdaq-sinks-4-as-the-ai-sell-off-returns-pushing-anthropic-below-its-83-ipo-price",
    "nasdaq-sinks-4-as-the-ai-sell-off-returns-pushing-anthropic-below-its-83-ipo",
  ],
  [
    "dollar-pulls-back-from-a-near-two-year-high-as-the-nvidia-rally-revives-fed-hike-bets",
    "dollar-pulls-back-from-a-near-two-year-high-as-the-nvidia-rally-revives-fed-hike",
  ],
  [
    "aerovironment-lands-315m-initial-award-under-940m-idiq-contract-from-undisclosed-u-s-customer",
    "aerovironment-lands-315m-initial-award-under-940m-idiq-contract-from-undisclosed",
  ],
];

test("B-01: a full-length slug maps to the slug the backend stored the post under", () => {
  for (const [full, live] of BROKEN_LINK_SHAPES) {
    assert.equal(backendSlugCut(full), live);
    assert.equal(movedSlugCandidates(full)[0], live);
  }
  assert.deepEqual(movedSlugCandidates("short-slug"), []);
});

test("B-01: the post page 301s a link built from the full title to the live post", () => {
  const page = fs.readFileSync("app/posts/[slug]/page.tsx", "utf8");
  assert.match(page, /findMovedPostSlug\(slug\)[\s\S]{0,80}permanentRedirect\(postPath\(moved\)\)/);
});

test("B-02: a post's own stored slug wins over another post's shortened alias", () => {
  const src = fs.readFileSync("lib/blog/posts.ts", "utf8");
  const fn = src.slice(src.indexOf("export async function getPublishedPostBySlug"));
  assert.ok(fn.indexOf("publishedByStoredSlug(slug)") < fn.indexOf("storedPostSlug(slug)"));
});

test("B-02: short aliases are unique and never another entry's stored slug", () => {
  const stored = new Set(SHORTENED_POSTS.map(([s]) => s));
  const shorts = SHORTENED_POSTS.map(([, s]) => s);
  assert.equal(new Set(shorts).size, shorts.length);
  for (const s of shorts) assert.ok(!stored.has(s), s);
});
