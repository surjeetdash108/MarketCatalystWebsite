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

test("each tile's CTA opens the app's /manage-plan with that plan and interval (annual by default)", () => {
  for (const plan of ["starter", "pro", "elite"]) {
    assert.match(html, new RegExp(`data-plan="${plan}" href="https://app\\.marketcatalyst\\.ai/manage-plan\\?plan=${plan}&amp;interval=annual"`));
  }
});

test("the Monthly/Annual switch rewrites each CTA's interval", () => {
  assert.match(raw, /cta: card\.querySelector\('\.mc-plan-cta'\)/);
  assert.match(raw, /u\.searchParams\.set\('interval', annual \? 'annual' : 'monthly'\)/);
});

test("pricing copy: no renewal/refund note under the heading, and no unverified strategy count", () => {
  // The green renewal/refund note under "One platform. Simple plans." was removed on purpose.
  assert.doesNotMatch(html, /Renews automatically until you cancel/);
  assert.doesNotMatch(raw, /\{\{REFUND_LINE\}\}/);
  assert.doesNotMatch(raw, /Full refund within \d+ day/);
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

test("tiles render the same before the backend deploy, after it (catalog not applied) and after the catalog apply", async () => {
  const ok = (body: unknown) => (async () => new Response(JSON.stringify(body), { status: 200 })) as unknown as typeof fetch;
  const render = async (body: unknown) => {
    const { plans, source } = await loadCatalog(ok(body));
    return { source, tiles: plansSection(homeDocument(plans)) };
  };
  // 1. Today's production GET /plans: the v1 plans docs, no `prices` (shape read 2026-11-10).
  const v1 = { plans: [
    { id: "free", name: "Free", amount: 0, currency: "USD", billingCycle: "none", active: true, sortOrder: 0, featureFlags: {} },
    { id: "plus", name: "Plus", amount: 2999, currency: "USD", billingCycle: "monthly", active: true, sortOrder: 1, featureFlags: {} },
    { id: "pro", name: "Pro", amount: 4999, currency: "USD", billingCycle: "monthly", active: true, sortOrder: 2, featureFlags: {} },
  ] };
  // 2./3. The new backend serves catalog v2 — from the registry before the apply,
  // from the stored docs after it (same prices, extra stored fields).
  const v2 = (extra: Record<string, unknown>) => ({ paidPlansAvailable: false, plans: fallbackCatalog().map((p, i) => ({ ...p, amount: p.prices.monthly?.amount ?? 0, active: true, sortOrder: i, featureFlags: {}, ...extra })) });
  const before = await render(v1);
  const deployed = await render(v2({}));
  const applied = await render(v2({ catalogVersion: 2, createdAt: "2026-11-10T00:00:00.000Z" }));
  assert.equal(before.source, "fallback");
  assert.equal(deployed.source, "live");
  assert.equal(applied.source, "live");
  assert.equal(deployed.tiles, before.tiles);
  assert.equal(applied.tiles, before.tiles);
  for (const price of ["$39", "$31.20", "$374.40", "$59", "$47.20", "$566.40", "$199", "$149.25", "$1,791"]) assert.ok(before.tiles.includes(price), price);
  for (const old of ["$29.99", "$49.99"]) assert.ok(!before.tiles.includes(old), old);
});

test("pricing header is centred and the renewal/refund note wraps instead of overflowing", () => {
  assert.match(raw, /\.mc-pricing \.mc-head-row>div:first-child\{width:100%;min-width:0;text-align:center\}/);
  assert.match(raw, /\.mc-pricing \.mc-h2\{text-align:center\}/);
  assert.match(raw, /\.mc-pricing \.mc-cancel-hl\{white-space:normal;max-width:min\(760px,100%\)/);
});

test("tile bullets and every plan includes are catalog tokens in raw home.html, not hardcoded", () => {
  assert.match(raw, /\{\{BULLETS:starter\}\}/);
  assert.match(raw, /\{\{BULLETS:pro\}\}/);
  assert.match(raw, /\{\{BULLETS:elite\}\}/);
  assert.match(raw, /\{\{EVERY_PLAN_INCLUDES\}\}/);
  assert.doesNotMatch(raw, /Market Desk: all 15 workspaces/);
});

test("rendered page contains bullets from catalog.json and no 'free' mention in hero CTA", () => {
  assert.match(html, /Market Catalyst: all workspaces/);
  assert.match(html, /Stock Intelligence and AI research/);
  assert.match(html, /Money Flow by sector/);
  assert.match(html, /Strategy Lab entry, stop and target levels/);
  assert.doesNotMatch(html, /Sign up for free/);
  assert.match(html, /Get started <i>→<\/i>/);
});
