import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (f: string) => fs.readFileSync(f, "utf8");

test("W-08: Contact doesn't claim details are never passed to a third party", () => {
  const c = read("app/contact/page.tsx");
  assert.doesNotMatch(c, /never passed to a third party/);
  assert.match(c, /Our email provider processes messages on our behalf/);
});

test("W-09: About's retention card doesn't cite a policy that isn't published", () => {
  assert.doesNotMatch(read("app/about/page.tsx"), /under a published policy/);
});

test("W-13: the illustrative chart is labelled Illustrative, never LIVE", () => {
  const chart = read("components/chrome/MarketChart.tsx");
  assert.doesNotMatch(chart, />LIVE</);
  assert.match(chart, />Illustrative</);
});
