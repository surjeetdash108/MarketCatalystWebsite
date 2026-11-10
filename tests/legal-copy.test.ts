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
  // Both render the same generated refund paragraph (REFUND_WINDOW_DAYS); only the import name differs.
  const section = (s: string) =>
    s.slice(s.indexOf('<h2 id="subscriptions">'), s.indexOf("</ul>", s.indexOf('<h2 id="subscriptions">'))).replace(/\s+/g, " ").replace("{refundPolicy().termsParagraph}", "{REFUND_POLICY.termsParagraph}");
  assert.equal(section(terms), section(appTerms));
});

test("Privacy discloses the retention hash and the email provider", () => {
  assert.match(privacy, /one-way cryptographic hash of your email address/);
  assert.match(privacy, /through our email provider, Twilio SendGrid,/);
  assert.doesNotMatch(privacy, /\[EMAIL PROVIDER PLACEHOLDER\]/);
});

test("refund paragraph comes from the generated policy; Privacy covers the phone and address", () => {
  assert.match(terms, /<span data-testid="terms-refunds">\{refundPolicy\(\)\.termsParagraph\}<\/span>/);
  assert.match(privacy, /We do not send marketing text messages unless you opt in/);
  assert.match(privacy, /We keep only your country, state and ZIP\/postal code/);
});
