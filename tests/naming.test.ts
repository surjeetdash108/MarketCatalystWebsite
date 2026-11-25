import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// W-10 glossary (owner decision, 26 Nov 2026): the brand is "MarketCatalyst";
// the workspace is "Market Catalyst"; there is no "Market Desk".
test("no 'Market Desk' in shipped copy", () => {
  for (const f of ["lib/landing/home.html", "lib/pricing/catalog.json", "app/about/page.tsx", "content/careers.ts"]) {
    assert.doesNotMatch(fs.readFileSync(f, "utf8"), /Market Desk/, f);
  }
});
