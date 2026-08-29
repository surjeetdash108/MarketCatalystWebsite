/**
 * The blog's common stylesheet.
 *
 * ONE design for every article: the admin uploads the same template each time
 * and only the content changes, so the CSS belongs in a single place rather
 * than copied onto each post — which is what the old per-post `css` field did,
 * and why two posts could silently disagree about what the blog looks like.
 *
 * This is the default. It is written to blog_theme/current, and uploading a
 * document with its own <style> replaces it there — the stored copy is the
 * source of truth, this is what the blog falls back to when nothing has been
 * uploaded yet.
 *
 * The first half is the approved template's own stylesheet, verbatim. The
 * second half is everything it never needed: it styles `a`, `body`, `table`
 * and its component classes, and takes the rest from Tailwind utilities in its
 * markup — so a pasted article, which carries no utilities, had no rules for
 * headings, paragraphs, lists, quotes or code and rendered at browser defaults.
 *
 * Selectors are written plainly (`h2`, `a`, `.card`). The reader's page scopes
 * them to the article before applying, so `body { background }` restyles the
 * article rather than the site — see scopeCss in PostHtmlDoc.
 */
export const DEFAULT_BLOG_CSS = String.raw`
:root{
    --mc-bg:#f9f9f9;
    --mc-text:#1a1a1a;
    --mc-blue:#0984e3;
    --mc-green:#00b894;
    --mc-red:#d63031;
  }
  body{
    font-family:'Inter', sans-serif;
    background-color:var(--mc-bg);
    color:var(--mc-text);
    -webkit-font-smoothing:antialiased;
  }
  h1,h2,h3,h4{ letter-spacing:-0.02em; }
  .mc-badge{
    text-transform:uppercase;
    letter-spacing:0.14em;
    font-size:0.78rem;
    font-weight:700;
    color:var(--mc-blue);
  }
  .mistake-card{
    border-left:4px solid #00b894;
    background-color:#f0fff4;
    padding:24px;
    border-radius:0 8px 8px 0;
  }
  .image-container{ margin:32px 0; }
  .image-container img,
  .image-container svg{
    width:100%;
    height:auto;
    display:block;
    border-radius:8px;
    background:#ffffff;
    border:1px solid #e8e8e8;
  }
  .image-caption{
    font-style:italic;
    color:#666;
    font-size:0.9rem;
    text-align:center;
    margin-top:10px;
  }
  .tag-pill{
    display:inline-block;
    background:#e2e8f0;
    color:#4a5568;
    padding:4px 12px;
    border-radius:9999px;
    font-size:0.8rem;
    font-weight:500;
    margin:0 6px 8px 0;
  }
  .card{
    background:#ffffff;
    border:1px solid #ececec;
    border-radius:10px;
    padding:20px;
  }
  .up{ color:var(--mc-green); font-weight:600; }
  .down{ color:var(--mc-red); font-weight:600; }
  .flat{ color:#4a5568; font-weight:600; }
  table{ width:100%; border-collapse:collapse; }
  th{
    text-align:left;
    font-size:0.72rem;
    text-transform:uppercase;
    letter-spacing:0.08em;
    color:#6b7280;
    padding:10px 12px;
    border-bottom:2px solid #e5e7eb;
  }
  td{ padding:12px; border-bottom:1px solid #f0f0f0; font-size:0.95rem; }
  td.num{ text-align:right; font-variant-numeric:tabular-nums; }
  th.num{ text-align:right; }
  .section-rule{ border:0; border-top:1px solid #e5e7eb; margin:44px 0; }
  .kicker{
    text-transform:uppercase;
    letter-spacing:0.12em;
    font-size:0.7rem;
    font-weight:700;
    color:#6b7280;
  }
  a{ color:var(--mc-blue); }

/* ══════════════════════════════════════════════════════════════════════════
   ADDED — everything the template's own stylesheet never needed.

   The template styles "a", "body", "table" and its dozen component classes,
   and gets the rest from Tailwind utilities written into its markup. An
   article pasted or typed into the editor carries none of those utilities: it
   is plain <h2>, <p>, <ul>, <blockquote>. Without the rules below such a post
   renders at browser defaults — which is exactly how the .NET Conf post came
   out — so this layer is what makes ANY content look like the template, not
   just the document the template was cut from.
   ══════════════════════════════════════════════════════════════════════════ */

/* ── headings ───────────────────────────────────────────────────────────── */
h1 { font-size: clamp(1.9rem, 4.4vw, 2.6rem); line-height: 1.14; font-weight: 800; margin: 0 0 16px; }
h2 { font-size: 1.6rem;  line-height: 1.25; font-weight: 700; margin: 40px 0 14px; }
h3 { font-size: 1.25rem; line-height: 1.3;  font-weight: 700; margin: 32px 0 12px; }
h4 { font-size: 1.05rem; line-height: 1.4;  font-weight: 700; margin: 26px 0 10px; }
h5, h6 { font-size: .95rem; font-weight: 700; margin: 22px 0 8px; color: var(--mc-text); }
h2 + p, h3 + p, h4 + p { margin-top: 0; }

/* ── body copy ──────────────────────────────────────────────────────────── */
p  { font-size: 1.02rem; line-height: 1.75; color: #33425f; margin: 0 0 20px; }
strong, b { color: var(--mc-text); font-weight: 700; }
em, i { font-style: italic; }
small { font-size: .86rem; color: #6b7280; }
mark { background: #fff3bf; padding: 0 3px; border-radius: 3px; }
sup, sub { font-size: .72em; }

/* ── links ──────────────────────────────────────────────────────────────
   The template sets a colour and nothing else, so a link was indistinguishable
   from bold text once it had been visited. */
a { color: var(--mc-blue); text-decoration: underline; text-underline-offset: 2px;
    text-decoration-thickness: 1px; transition: color .15s ease; }
a:hover { color: #0b6fbe; text-decoration-thickness: 2px; }
a:visited { color: #6b4fbb; }
a:focus-visible { outline: 2px solid var(--mc-blue); outline-offset: 2px; border-radius: 3px; }

/* ── lists ──────────────────────────────────────────────────────────────── */
ul, ol { margin: 0 0 20px; padding-left: 26px; color: #33425f; }
li { font-size: 1.02rem; line-height: 1.7; margin: 8px 0; }
li > ul, li > ol { margin: 8px 0 0; }
li::marker { color: #8291ad; }
dl { margin: 0 0 20px; } dt { font-weight: 700; margin-top: 12px; } dd { margin: 4px 0 0 18px; color: #33425f; }

/* ── quotes, code, rules ────────────────────────────────────────────────── */
blockquote { margin: 0 0 22px; padding: 4px 0 4px 18px; border-left: 3px solid #e5e7eb;
  color: #5a6b8c; font-size: 1.04rem; }
blockquote p:last-child { margin-bottom: 0; }
code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: .9em;
  background: #f1f3f5; padding: 2px 6px; border-radius: 5px; color: #1f2933; }
pre { background: #0b1220; color: #e6edf7; padding: 16px 18px; border-radius: 10px;
  overflow-x: auto; margin: 0 0 20px; line-height: 1.6; }
pre code { background: none; padding: 0; color: inherit; font-size: .88rem; }
hr { border: 0; border-top: 1px solid #e5e7eb; margin: 40px 0; }

/* ── figures and images ─────────────────────────────────────────────────── */
/* The template frames everything in .image-container with a 1px edge on white,
   which is right for its SVG charts — they are drawn on white and need
   something to sit on. A photograph does not: the frame renders as a white
   border around the picture. Charts keep the edge; images lose it. */
.image-container img { border: 0; background: none; }
img { max-width: 100%; height: auto; display: block; border-radius: 8px; }
figure { margin: 32px 0; }
figcaption { font-style: italic; color: #666; font-size: .9rem; text-align: center; margin-top: 10px; }

/* ── tables: the template styles th/td; these are the parts around them ─── */
table { margin: 0 0 22px; }
caption { caption-side: bottom; font-size: .85rem; color: #6b7280; padding-top: 8px; text-align: left; }
tbody tr:last-child td { border-bottom: 0; }
tbody tr:hover { background: #fafbfc; }

/* ── layout fallbacks ───────────────────────────────────────────────────
   The template's markup lays out with Tailwind utilities. Tailwind is served
   from our own origin and compiles in the browser, so these exist only to hold
   the shape for the moment before it runs — without them a recap flashes as a
   single unstyled column. */
.grid { display: grid; gap: 16px; }
.flex { display: flex; }
.flex-wrap { flex-wrap: wrap; }
.items-start { align-items: flex-start; }
.items-baseline { align-items: baseline; }
.justify-between { justify-content: space-between; }
.text-right { text-align: right; }
.text-center { text-align: center; }
.space-y-4 > * + * { margin-top: 16px; }
.space-y-6 > * + * { margin-top: 24px; }
.mb-2 { margin-bottom: 8px; } .mb-3 { margin-bottom: 12px; } .mb-4 { margin-bottom: 16px; }
.mb-5 { margin-bottom: 20px; } .mb-6 { margin-bottom: 24px; } .mb-10 { margin-bottom: 40px; }
.font-bold { font-weight: 700; } .font-extrabold { font-weight: 800; } .font-semibold { font-weight: 600; }
.text-sm { font-size: .875rem; } .text-lg { font-size: 1.125rem; } .text-2xl { font-size: 1.5rem; }
.text-3xl { font-size: 1.875rem; } .text-gray-500 { color: #6b7280; } .text-gray-600 { color: #4b5563; }
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: 1fr 1fr; }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}
`;
