// A post's back link reads "Back to Resources".
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const page = fs.readFileSync(path.join(process.cwd(), "app/posts/[slug]/page.tsx"), "utf8");
test("post back links say Resources", () => {
  assert.doesNotMatch(page, /Back to Research/);
  assert.equal((page.match(/← Back to Resources<\/Link>/g) || []).length, 2);
});
