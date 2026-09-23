/**
 * The "MarketCatalyst" wordmark used by SiteNav and SiteFooter.
 *
 * Used to be a single flattened `/logo.png` with the wordmark baked in as
 * white text — invisible on the light/paper theme's near-white background
 * (see app/theme.css `[data-theme="light"]`). Rendering "Market"/"Catalyst"
 * as real text instead, colored from the same `--mc-text`/`--mc-up` tokens
 * the rest of the nav uses, makes it theme-aware for free. `/logo-mark.png`
 * is the icon cropped out of that original file (colorful gradient bars, so
 * it reads fine on both themes unlike the wordmark did).
 */
export function BrandMark() {
  return (
    <>
      <img src="/logo-mark.png" alt="" className="mc-brand-logo" />
      <span className="mc-brand-word">
        Market<span className="mc-brand-word-accent">Catalyst</span>
      </span>
    </>
  );
}
