import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (f: string) => fs.readFileSync(f, "utf8");

test("W-16: /pricing, /login, /signup and /sitemap redirect instead of 404", () => {
  const cfg = read("next.config.ts");
  assert.match(cfg, /source: "\/pricing", destination: "\/#pricing", statusCode: 301/);
  assert.match(cfg, /source: "\/login", destination: `\$\{APP_URL\}\/auth\/login`, statusCode: 301/);
  assert.match(cfg, /source: "\/signup", destination: `\$\{APP_URL\}\/auth\/signup`, statusCode: 301/);
  assert.match(cfg, /source: "\/sitemap", destination: "\/sitemap\.xml"/);
});

test("W-17: a listing page past the last one is a 404", () => {
  assert.match(read("app/posts/page.tsx"), /if \(requested > lastPage\) notFound\(\);/);
});

test("W-18: the listing and breadcrumbs say Resources, like the nav", () => {
  const list = read("app/posts/page.tsx");
  assert.doesNotMatch(list, /"Blog"|· Blog`|MarketCatalyst blog/);
  assert.match(read("app/posts/[slug]/page.tsx"), /\{ name: "Resources", path: "\/posts" \}/);
});

test("B-06: the three duplicate scorecards 301 to their originals", async () => {
  const { DUPLICATE_POSTS } = await import("../lib/seo/duplicate-posts");
  const copies = new Map(DUPLICATE_POSTS);
  assert.equal(copies.get("northwest-natural-beats-q3-2026-estimates-as-revenue-rises-8-0-to-178-0m-2"), "northwest-natural-beats-q3-2026-estimates-as-revenue-rises-8-0-to-178-0m");
  assert.ok(copies.has("duke-energy-corporation-5-625-beats-q3-2026-estimates-as-revenue-rises-6-6-to-9"));
  assert.ok(copies.has("northwestern-energy-q3-2026-revenue-tops-estimates-at-423-8m-but-eps-misses-at-0-2"));
});
