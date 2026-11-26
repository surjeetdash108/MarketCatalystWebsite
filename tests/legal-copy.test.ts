import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { LEGAL_ENTITY, LEGAL_UPDATED } from "../lib/legal/entity";
import { fallbackCatalog, fillPriceTokens, purchaseTermsLine, subscriptionTerms } from "../lib/pricing/catalog";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const terms = read("components/marketing/TermsOfService.tsx");
const privacy = read("components/marketing/PrivacyPolicy.tsx");
// The app repo sits beside this one locally; CI checks out this repo alone, so
// the cross-repo comparisons read empty there and are skipped.
const HAS_APP = fs.existsSync(path.join(process.cwd(), "../MarketCatalystUI/app/auth/legal"));
const readApp = (p: string) => (HAS_APP ? read(`../MarketCatalystUI/${p}`) : "");
const appTerms = readApp("app/auth/legal/terms-content.tsx");
const appPrivacy = readApp("app/auth/legal/privacy-content.tsx");
const appEntity = readApp("app/auth/legal/legal-entity.ts");

// W-22 (24 Nov 2026 audit): the draft §12 with "[… PLACEHOLDER]" markers and
// support@example.com was live. The earlier version of this test REQUIRED those
// markers ("flagged for legal review"), which is part of how they shipped.
test("no draft markers, placeholders or example addresses on any legal page", () => {
  for (const [name, src] of Object.entries(HAS_APP ? { terms, privacy, appTerms, appPrivacy } : { terms, privacy })) {
    assert.doesNotMatch(src, /PLACEHOLDER/, name);
    assert.doesNotMatch(src, /example\.com/, name);
    assert.doesNotMatch(src, /Draft — legal review required/, name);
  }
});

// W-26 (26 Nov 2026 audit): Home sold a 7-day trial, renewal and "No refunds"
// while §12 said "launching soon". All of them now print the backend's one
// subscription-terms text (src/billing/refund/subscription-terms.ts).
test("Home, Terms §12 and checkout state the same trial, renewal and refund terms", () => {
  const t = subscriptionTerms();
  assert.match(t.purchaseLine, /7-day free trial from sign-up/);
  assert.match(t.purchaseLine, /No refunds/);
  // Home: the line under the plan toggle is the shared purchase line.
  assert.equal(purchaseTermsLine(), t.purchaseLine);
  const home = fillPriceTokens("{{PURCHASE_TERMS}}", fallbackCatalog());
  for (const part of [t.trialLine, t.renewalLine, "No refunds."]) assert.ok(home.includes(part.replace(/'/g, "")) || home.includes(part), part);
  // Terms §12 prints the shared paragraphs, and they carry every term Home states.
  assert.match(terms, /subscriptionTermsParagraphs\(\)\.map/);
  const s12 = t.termsParagraphs.join(" ");
  for (const phrase of ["7-day free trial", "renews automatically", "non-refundable", "cancel at any time in Manage Plan"]) assert.ok(s12.includes(phrase), phrase);
  assert.ok(!terms.includes("launching soon"));
  if (HAS_APP) {
    // The app's Terms and checkout read the same generated text.
    const generated = readApp("app/iq/billing/refund-policy.generated.ts");
    assert.ok(generated.includes(JSON.stringify(t.purchaseLine)), "app has the same purchase line");
    for (const p of t.termsParagraphs) assert.ok(generated.includes(JSON.stringify(p)), "app has the same §12 paragraph");
    assert.match(appTerms, /SUBSCRIPTION_TERMS\.termsParagraphs\.map/);
    assert.ok(!appTerms.includes("launching soon"));
    assert.match(readApp("app/iq/billing/checkout/summary-card.tsx"), /REFUND_POLICY\.checkoutLine/);
  }
});

test("one legal entity and one 'Last Updated' date, from lib/legal/entity, on both sites", () => {
  assert.equal(LEGAL_ENTITY, "MarketCatalyst Analytics LLC");
  assert.match(LEGAL_UPDATED, /^[A-Z][a-z]+ \d{1,2}, \d{4}$/);
  if (HAS_APP) {
    assert.ok(appEntity.includes(`LEGAL_ENTITY = "${LEGAL_ENTITY}"`), "app entity matches");
    assert.ok(appEntity.includes(`LEGAL_UPDATED = "${LEGAL_UPDATED}"`), "app date matches");
  }
  for (const src of HAS_APP ? [terms, privacy, appTerms, appPrivacy] : [terms, privacy]) {
    assert.match(src, /Last Updated: <strong>\{LEGAL_UPDATED\}<\/strong>/);
    assert.doesNotMatch(src, /MarketCatalyst (Analytics )?LLC(?! Analytics)/i, "entity only through LEGAL_ENTITY");
  }
});

test("prior versions are archived in the repo", () => {
  for (const f of ["terms-2026-10-22.tsx.txt", "privacy-2026-10-22.tsx.txt", "terms-2026-11-17.tsx.txt", "privacy-2026-11-17.tsx.txt"]) {
    assert.ok(fs.existsSync(path.join(process.cwd(), "docs/legal/archive", f)), f);
  }
});

test("Privacy discloses the retention hash and the email provider", () => {
  assert.match(privacy, /one-way cryptographic hash of your email address/);
  assert.match(privacy, /through our email provider, Twilio SendGrid,/);
  assert.match(privacy, /We do not send marketing text messages unless you opt in/);
  assert.match(privacy, /We keep only your country, state and ZIP\/postal code/);
});
