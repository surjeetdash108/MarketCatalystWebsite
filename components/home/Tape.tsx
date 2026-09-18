"use client";

import { tape as staticTape, tone, type TapeItem } from "./data";
import { useLiveTape } from "./live-tape";

/**
 * The marquee under the hero.
 *
 * Designed symbols until the live tape answers, then the real ones. The track
 * is always its own content doubled — HomeMotion.tsx wraps the scroll at
 * `scrollWidth / 2`, so a track that is not exactly two copies would jump at
 * the seam. It re-measures every frame, so the swap itself is free.
 *
 * Decorative: `aria-hidden` stays, because a screen reader being read twelve
 * percentages in a loop is noise, and the same figures are announced properly
 * in the HUD above.
 */
export function Tape() {
  const live = useLiveTape();

  const items: TapeItem[] =
    live && live.quotes.length > 0
      ? [...live.quotes, ...live.quotes]
      : staticTape;

  return (
    <section className="mc-tape" aria-hidden="true">
      <div className="mc-tape-track" id="mc-tape">
        {items.map((t, i) => (
          <div className="mc-tape-item" key={`${t.sym}-${i}`}>
            <b>{t.sym}</b>
            <span style={{ color: tone(t.tone) }}>{t.chg}</span>
            <i>/</i>
          </div>
        ))}
      </div>
    </section>
  );
}
