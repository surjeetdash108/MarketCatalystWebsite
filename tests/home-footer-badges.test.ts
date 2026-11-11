import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { homeDocument } from "../lib/landing/home-document";
import { fallbackCatalog } from "../lib/pricing/catalog";

const html = homeDocument(fallbackCatalog());
const badges = html.slice(html.indexOf('<div class="mc-footer-badges">'), html.indexOf('<div class="mc-footer-bottom">'));
const reactFooter = fs.readFileSync(path.join(process.cwd(), "components/chrome/SiteFooter.tsx"), "utf8");

test("homepage footer has the Nick Launches badge, same link/image/size/class as the React footer", () => {
  assert.match(
    badges,
    /<a href="https:\/\/nicklaunches\.com\/" target="_blank" rel="noopener" class="mc-badge-padded"><img src="https:\/\/nicklaunches\.com\/badges\/featured\.png" alt="Featured on Nick Launches" width="244" height="56"\/><\/a>/,
  );
  for (const part of ['href="https://nicklaunches.com/"', 'className="mc-badge-padded"', 'src="https://nicklaunches.com/badges/featured.png"', "width={244}", "height={56}"]) {
    assert.ok(reactFooter.includes(part), `React footer: ${part}`);
  }
});

test("homepage footer badge order: Startup Fame, then Nick Launches (as in the React footer)", () => {
  const sf = badges.indexOf("startupfa.me");
  const nl = badges.indexOf("nicklaunches.com");
  assert.ok(sf >= 0 && nl > sf);
  assert.equal(badges.split("nicklaunches.com/badges/featured.png").length - 1, 1);
});
