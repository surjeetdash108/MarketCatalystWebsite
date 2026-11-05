// /posts: 15 cards a page, and the pager under the list as well as above it.
// Run: npx tsx --test tests/
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { PER_PAGE } from "../lib/blog/sections";

const src = fs.readFileSync(new URL("../components/blog/BlogIndex.tsx", import.meta.url), "utf8");

describe("posts listing pager", () => {
  it("shows 15 posts per page", () => assert.equal(PER_PAGE, 15));
  it("draws the pager above and below the list, the bottom one scrolling back to the list top", () => {
    assert.match(src, /\{pager\(false\)\}/);
    assert.match(src, /\{pager\(true\)\}/);
    assert.match(src, /if \(toTop\) latestRef\.current\?\.scrollIntoView/);
  });
});
