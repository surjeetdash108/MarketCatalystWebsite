import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const html = fs.readFileSync(path.join(process.cwd(), "lib/landing/home.html"), "utf8");

test("pricing plans: Starter ($39/mo, 20% off annual -> $31.20/mo, $374.40/yr)", () => {
  assert.match(
    html,
    /<span class="mc-plan-name">Starter<\/span><\/div><div class="mc-plan-price"><s class="mc-plan-was">\$39<\/s><b>\$31\.20<\/b><span>\/mo<\/span><\/div><div class="mc-plan-bill">Billed \$374\.40\/year <em>You save 20%<\/em><\/div>/,
    "Starter plan must show $39 monthly, $31.20/mo annual (20% off), billed $374.40/year"
  );
});

test("pricing plans: Pro ($59/mo, 20% off annual -> $47.20/mo, $566.40/yr)", () => {
  assert.match(
    html,
    /<span class="mc-plan-name">Pro<\/span><span class="mc-plan-flag">Most popular<\/span><\/div><div class="mc-plan-price"><s class="mc-plan-was">\$59<\/s><b>\$47\.20<\/b><span>\/mo<\/span><\/div><div class="mc-plan-bill">Billed \$566\.40\/year <em>You save 20%<\/em><\/div>/,
    "Pro plan must show $59 monthly, $47.20/mo annual (20% off), billed $566.40/year"
  );
});

test("pricing plans: Elite ($199/mo, 25% off annual -> $149.25/mo, $1,791/yr)", () => {
  assert.match(
    html,
    /<span class="mc-plan-name">Elite<\/span><span class="mc-plan-ribbon" aria-label="Save 25% on annual billing">Save 25%<\/span><\/div><div class="mc-plan-price"><s class="mc-plan-was">\$199<\/s><b>\$149\.25<\/b><span>\/mo<\/span><\/div><div class="mc-plan-bill">Billed \$1,791\/year<\/div>/,
    "Elite plan must show $199 monthly, $149.25/mo annual (25% off), billed $1,791/year"
  );
});

test("pricing plans: old plan prices ($49, $79, $249) are removed from pricing cards", () => {
  const plansSection = html.slice(html.indexOf('class="mc-plans"'), html.indexOf('class="mc-every"'));
  assert.doesNotMatch(plansSection, /\$49<\/s>/);
  assert.doesNotMatch(plansSection, /\$79<\/s>/);
  assert.doesNotMatch(plansSection, /\$249<\/s>/);
  assert.doesNotMatch(plansSection, /\$39\.20<\/b>/);
  assert.doesNotMatch(plansSection, /\$63\.20<\/b>/);
  assert.doesNotMatch(plansSection, /\$186\.75<\/b>/);
  assert.doesNotMatch(plansSection, /\$470\.40/);
  assert.doesNotMatch(plansSection, /\$758\.40/);
  assert.doesNotMatch(plansSection, /\$2,241/);
});

