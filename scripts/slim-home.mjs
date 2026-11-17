#!/usr/bin/env node
/**
 * Slim down lib/landing/home.html.
 *
 * The design build of the landing page is one self-contained file: fonts and
 * images are base64 inside the HTML, the product tour is a ~5 MB inline script,
 * and a frozen copy of the old About overlay rides along as inert text. That made
 * the home document ~8 MB (~2.7 MB gzipped), which is what PageSpeed measured as a
 * 14.5 s mobile FCP/LCP.
 *
 * This moves the heavy parts out of the HTML so the browser can paint before it
 * has them:
 *
 *   1. drops the unused About overlay (<script type="text/html" id="mc-about-src">;
 *      About lives at /about)
 *   2. base64 fonts            -> public/landing/fonts/<hash>.woff2
 *   3. big base64 images       -> public/landing/img/<hash>.webp
 *   4. the big inline tour <script> -> public/landing/tour.<hash>.js, loaded `defer`
 *
 * Output names are content hashes, so they are safe to cache forever (see the
 * /landing headers in next.config.ts) and re-running on an unchanged file is a
 * no-op. Run it again whenever a new design build is copied over home.html:
 *
 *     node scripts/slim-home.mjs
 *
 * The {{PRICE:...}} / {{BULLETS:...}} tokens only live in the markup, never in the
 * moved script, so lib/pricing/catalog.ts keeps working on the slimmed file.
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOME = path.join(root, "lib", "landing", "home.html");
const OUT = path.join(root, "public", "landing");
const hash = (buf) => createHash("sha256").update(buf).digest("hex").slice(0, 12);

/** Only images at least this big are worth a request of their own. */
const MIN_IMAGE_BYTES = 20_000;
/** Only an inline script at least this big is moved out. */
const MIN_SCRIPT_CHARS = 500_000;

let html = readFileSync(HOME, "utf8");
const before = Buffer.byteLength(html);
const stats = { about: 0, fonts: 0, images: 0, script: 0 };

function emit(dir, name, data) {
  mkdirSync(path.join(OUT, dir), { recursive: true });
  writeFileSync(path.join(OUT, dir, name), data);
}

// 1. The frozen About overlay. It ends at the first </script> after it opens,
//    which is where the browser ends it too.
const aboutOpen = '<script type="text/html" id="mc-about-src">';
const a = html.indexOf(aboutOpen);
if (a >= 0) {
  const end = html.indexOf("</script>", a);
  if (end < 0) throw new Error("mc-about-src is never closed");
  stats.about = end + "</script>".length - a;
  html = html.slice(0, a) + html.slice(end + "</script>".length);
}

// 2. Fonts.
html = html.replace(/url\((["']?)data:font\/woff2;base64,([A-Za-z0-9+/=]+)\1\)/g, (_m, _q, b64) => {
  const buf = Buffer.from(b64, "base64");
  const name = `${hash(buf)}.woff2`;
  emit("fonts", name, buf);
  stats.fonts++;
  return `url(/landing/fonts/${name})`;
});

// 3. Large images, in markup (src="...") and in CSS (url(...)).
html = html.replace(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g, (m, b64) => {
  const buf = Buffer.from(b64, "base64");
  if (buf.length < MIN_IMAGE_BYTES) return m;
  const name = `${hash(buf)}.webp`;
  emit("img", name, buf);
  stats.images++;
  return `/landing/img/${name}`;
});

// 4. The tour script: the one huge classic inline <script> with no attributes.
for (const m of html.matchAll(/<script>/g)) {
  const end = html.indexOf("</script>", m.index);
  const body = html.slice(m.index + "<script>".length, end);
  if (body.length < MIN_SCRIPT_CHARS) continue;
  if (body.includes("</script")) throw new Error("tour script contains a literal </script");
  const name = `tour.${hash(body)}.js`;
  emit("", name, body);
  html = html.slice(0, m.index) + `<script src="/landing/${name}" defer></script>` + html.slice(end + "</script>".length);
  stats.script = body.length;
  break;
}

writeFileSync(HOME, html);
const after = Buffer.byteLength(html);
console.log(
  `home.html ${(before / 1e6).toFixed(2)} MB -> ${(after / 1e6).toFixed(2)} MB` +
    ` | about template removed: ${(stats.about / 1e6).toFixed(2)} MB` +
    ` | fonts moved: ${stats.fonts} | images moved: ${stats.images}` +
    ` | script moved: ${(stats.script / 1e6).toFixed(2)} MB`,
);
