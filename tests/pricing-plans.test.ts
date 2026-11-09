import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { homeDocument } from "../lib/landing/home-document";
import { fallbackCatalog, fillPriceTokens, isCompleteCatalog, loadCatalog, type CatalogPlan } from "../lib/pricing/catalog";

const raw = fs.readFileSync(path.join(process.cwd(), "lib/landing/home.html"), "utf8");
const html = homeDocument(fallbackCatalog());
const plansSection = (h: string) => h.slice(h.indexOf('class="mc-plans"'), h.indexOf('class="mc-every"'));

test("pricing plans: Starter ($39/mo, 20% off annual -> $31.20/mo, $374.40/yr)", () => {
  assert.match(html, /<span class="mc-plan-name">Starter<\/span><\/div><div class="mc-plan-price"><s class="mc-plan-was">\$39<\/s><b>\$31\.20<\/b><span>\/mo<\/span><\/div><div class="mc-plan-bill">Billed \$374\.40\/year <em>You save 20%<\/em><\/div>/);
});

test("pricing plans: Pro ($59/mo, 20% off annual -> $47.20/mo, $566.40/yr)", () => {
  assert.match(html, /<span class="mc-plan-name">Pro<\/span><span class="mc-plan-flag">Most popular<\/span><\/div><div class="mc-plan-price"><s class="mc-plan-was">\$59<\/s><b>\$47\.20<\/b><span>\/mo<\/span><\/div><div class="mc-plan-bill">Billed \$566\.40\/year <em>You save 20%<\/em><\/div>/);
});

test("pricing plans: Elite ($199/mo, 25% off annual -> $149.25/mo, $1,791/yr)", () => {
  assert.match(html, /<span class="mc-plan-name">Elite<\/span><span class="mc-plan-ribbon" aria-label="Save 25% on annual billing">Save 25%<\/span><\/div><div class="mc-plan-price"><s class="mc-plan-was">\$199<\/s><b>\$149\.25<\/b><span>\/mo<\/span><\/div><div class="mc-plan-bill">Billed \$1,791\/year<\/div>/);
  assert.match(html, /Annual <em>Save up to 25%<\/em>/);
});

test("no price is typed into the page: every tile price is a catalog token", () => {
  const section = plansSection(raw);
  assert.doesNotMatch(section, /\$\d/);
  assert.equal((section.match(/\{\{PRICE:/g) ?? []).length, 9);
});

test("tiles follow the catalog: change a price there and the page changes", () => {
  const changed: CatalogPlan[] = fallbackCatalog().map((p) => (p.id === "pro" ? { ...p, prices: { monthly: { amount: 6900, lookupKey: "pro_monthly" }, annual: { amount: 66240, lookupKey: "pro_annual" } } } : p));
  const doc = plansSection(fillPriceTokens(raw, changed));
  assert.match(doc, /\$69<\/s><b>\$55\.20<\/b>/);
  assert.match(doc, /Billed \$662\.40\/year/);
});

test("old plan prices ($49, $79, $249, $29.99, $49.99) are not shown", () => {
  const section = plansSection(html);
  for (const re of [/\$49<\/s>/, /\$79<\/s>/, /\$249<\/s>/, /\$29\.99/, /\$49\.99/]) assert.doesNotMatch(section, re);
});

test("each tile's CTA opens signup with that plan and interval (annual by default)", () => {
  for (const plan of ["starter", "pro", "elite"]) {
    assert.match(html, new RegExp(`data-plan="${plan}" href="https://app\\.marketcatalyst\\.ai/auth/signup\\?plan=${plan}&amp;interval=annual"`));
  }
});

test("the Monthly/Annual switch rewrites each CTA's interval", () => {
  assert.match(raw, /cta: card\.querySelector\('\.mc-plan-cta'\)/);
  assert.match(raw, /u\.searchParams\.set\('interval', annual \? 'annual' : 'monthly'\)/);
});

test("pricing copy: cancel line and no unverified strategy count", () => {
  assert.match(html, /Cancel anytime\. You keep access until the end of your billing period\./);
  assert.doesNotMatch(html, /no questions asked/);
  assert.doesNotMatch(html, /56 strategies|Fifty-six/);
});

test("catalog loading: live GET /plans when complete, generated copy otherwise", async () => {
  const live = { plans: fallbackCatalog() };
  const ok = (body: unknown) => (async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
  assert.equal((await loadCatalog(ok(live))).source, "live");
  // An older backend (free/plus/pro) is not a complete catalog → fallback.
  assert.equal((await loadCatalog(ok({ plans: [{ id: "free", prices: {} }, { id: "plus", prices: { monthly: { amount: 2999 } } }] }))).source, "fallback");
  assert.equal((await loadCatalog((async () => { throw new Error("down"); }) as unknown as typeof fetch)).source, "fallback");
  assert.equal(isCompleteCatalog(fallbackCatalog()), true);
});
