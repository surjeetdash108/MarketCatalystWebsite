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

test("W-14: US spelling on About, one spelling of advisor on every page", () => {
  for (const f of ["app/about/page.tsx", "components/marketing/TermsOfService.tsx", "components/marketing/PrivacyPolicy.tsx"]) {
    const src = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(src, /Normalisation|personalised|summariser/, f);
    assert.doesNotMatch(src, /\badvisers?\b/, f);
  }
});

test("W-27: no 'options figures' in Terms while there is no options chain", () => {
  assert.doesNotMatch(fs.readFileSync("components/marketing/TermsOfService.tsx", "utf8"), /options figures/);
});

test("W-10: Careers names the customer-facing tools (Trade Builder, Trade Tracker), not internal ones", () => {
  const src = fs.readFileSync("content/careers.ts", "utf8");
  assert.doesNotMatch(src, /Thesis Lab|Thesis Monitor/);
  assert.match(src, /Trade Builder and Trade Tracker/);
});
