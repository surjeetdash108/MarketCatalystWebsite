import { test } from "node:test";
import assert from "node:assert/strict";
import { homeDocument } from "../lib/landing/home-document";
import { fallbackCatalog } from "../lib/pricing/catalog";

const html = homeDocument(fallbackCatalog());
const badges = html.slice(html.indexOf('<div class="mc-footer-badges">'), html.indexOf('<div class="mc-footer-bottom">'));

test("homepage footer does not show the Nick Launches badge", () => {
  assert.ok(badges.length > 0, "footer badges block found");
  assert.equal(badges.includes("nicklaunches.com"), false);
});

test("homepage footer keeps the Startup Fame and NicheLoom badges, in that order", () => {
  const sf = badges.indexOf("startupfa.me");
  const nl = badges.indexOf("nicheloom.com");
  assert.ok(sf >= 0 && nl > sf);
});
