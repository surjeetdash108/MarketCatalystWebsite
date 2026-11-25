import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const careers = fs.readFileSync("content/careers.ts", "utf8");

test("Careers names the real plans, never a Free plan (W-01/W-20)", () => {
  assert.doesNotMatch(careers, /\bFree, Pro and Elite\b/);
  assert.doesNotMatch(careers, /\bfree users\b/i);
  assert.match(careers, /Starter, Pro and Elite plans/);
});

test("open roles carry no validThrough until a role closes (owner decision, 26 Nov 2026)", () => {
  assert.doesNotMatch(careers, /validThrough/);
});
