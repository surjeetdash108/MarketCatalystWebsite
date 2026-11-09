import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const terms = read("components/marketing/TermsOfService.tsx");
const privacy = read("components/marketing/PrivacyPolicy.tsx");
const appTerms = read("../MarketCatalystUI/app/auth/legal/terms-content.tsx");

test("Terms §12 describes the real billing behaviour and is flagged for legal review", () => {
  for (const phrase of ["Manage Plan page", "you keep access to your paid plan until that date", "prorated amount", "end of the current billing period", "following 7 days", "once per person", "at least 30 days"]) {
    assert.ok(terms.includes(phrase), phrase);
  }
  assert.match(terms, /\[LEGAL REVIEW PLACEHOLDER/);
});

test("website and app Terms §12 are the same text", () => {
  const section = (s: string) => s.slice(s.indexOf('<h2 id="subscriptions">'), s.indexOf("</ul>", s.indexOf('<h2 id="subscriptions">'))).replace(/\s+/g, " ");
  assert.equal(section(terms), section(appTerms));
});

test("Privacy discloses the retention hash and the email provider", () => {
  assert.match(privacy, /one-way cryptographic hash of your email address/);
  assert.match(privacy, /\[EMAIL PROVIDER PLACEHOLDER\]/);
});
