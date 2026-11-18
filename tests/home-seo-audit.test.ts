// The 16 Nov homepage SEO audit fixes: a keyword H1, the new hero subhead, no repeated
// indicator stats, and the "Latest market recaps" links.
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { homeDocument, latestPostsBlock } from "../lib/landing/home-document";

const html = fs.readFileSync(path.join(process.cwd(), "lib/landing/home.html"), "utf8");

test("the page has exactly one H1 outside the inert About page, and it carries the keywords", () => {
  const head = html.slice(0, html.indexOf('<section class="mc-show"'));
  assert.equal((head.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.match(head, /<h1 class="mc-hero-tag">[^]*AI stock research and market intelligence for retail traders<\/h1>/);
  // the big visual headline stays, as a styled paragraph
  assert.match(head, /<p class="mc-h1">[^]*The institutional edge,/);
});

test("the hero subhead says what the product does", () => {
  assert.match(html, /Every stock scored on business, earnings, valuation, technicals, flows and macro/);
});

test("Stock Intelligence lists the 20 indicators once, not again as 8 + 12", () => {
  assert.doesNotMatch(html, /<strong>Oscillators<\/strong>/);
  assert.doesNotMatch(html, /<strong>Moving averages<\/strong>/);
  assert.match(html, /<strong>Technical indicators<\/strong><span>8 oscillators and 12 moving averages/);
});

test("latest recaps: links the posts by their public path, escapes titles, dates in UTC", () => {
  const block = latestPostsBlock([
    { title: 'A & B <script>"x"', slug: "some-post", publishedAt: "2026-11-18T23:30:00.000Z" },
    { title: "No date", slug: "other-post", publishedAt: null },
  ]);
  assert.match(block, /href="\/posts\/some-post"/);
  assert.match(block, /<time datetime="2026-11-18">Nov 18, 2026<\/time>/);
  assert.doesNotMatch(block, /<script>/);
  assert.match(block, /A &amp; B &lt;script>&quot;x&quot;/);
  assert.equal((block.match(/<time/g) ?? []).length, 1);
});

test("latest recaps: nothing is rendered without posts, and the slot never leaks into the page", () => {
  assert.equal(latestPostsBlock([]), "");
  assert.doesNotMatch(homeDocument(undefined, []), /MC_LATEST_POSTS/);
  const withPosts = homeDocument(undefined, [{ title: "T", slug: "t", publishedAt: null }]);
  assert.match(withPosts, /id="latest"/);
  assert.doesNotMatch(withPosts, /MC_LATEST_POSTS/);
});
