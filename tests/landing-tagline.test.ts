// Home page modules section heading: "Cutting-edge tools for retail traders.
// Preview what's inside."
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const html = fs.readFileSync(path.join(process.cwd(), "lib/landing/home.html"), "utf8");

test("the modules heading invites a preview", () => {
  // "Preview" is set upright in the page text colour; "what's inside." is the italic serif.
  assert.match(html, /<h2 class="mc-h2 mc-show-title"[^>]*>Cutting-edge tools for <span class="mc-serif">retail traders\.<\/span> <span[^>]*>Preview<\/span> <span class="mc-serif">what(?:’|&rsquo;)s inside\.<\/span><\/h2>/);
});
