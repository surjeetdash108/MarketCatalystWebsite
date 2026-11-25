import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { LEGAL_ENTITY, LEGAL_UPDATED } from "../lib/legal/entity";

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

test("§12 is the neutral pre-launch paragraph until counsel approves the full text", () => {
  const neutral = "Paid plans are launching soon. Subscription terms will be published here before any charge.";
  assert.ok(terms.includes(neutral));
  if (HAS_APP) assert.ok(appTerms.includes(neutral));
  // The full draft stays in the repo, not on the page.
  assert.ok(fs.existsSync(path.join(process.cwd(), "docs/legal/terms-section-12-subscriptions-DRAFT.txt")));
  for (const gone of ["7-day free trial", "non-refundable", "Retention offer"]) {
    assert.ok(!terms.includes(gone), gone);
    if (HAS_APP) assert.ok(!appTerms.includes(gone), gone);
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
