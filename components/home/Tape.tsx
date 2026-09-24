"use client";

import { tape as staticTape, tone, type TapeItem } from "./data";
import { useLiveTape } from "./live-tape";
import type { LiveTape } from "@/lib/market/tape-types";

/**
 * The marquee under the hero.
 *
 * Server-rendered with the real quotes (`initial`), then kept current by the
 * live store. Placeholder symbols with no move only if neither exists. The track
 * is always its own content doubled — HomeMotion.tsx wraps the scroll at
 * `scrollWidth / 2`, so a track that is not exactly two copies would jump at
 * the seam. It re-measures every frame, so the swap itself is free.
 *
 * Decorative: `aria-hidden` stays, because a screen reader being read twelve
 * percentages in a loop is noise, and the same figures are announced properly
 * in the HUD above.
 */
export function Tape({ initial }: { initial: LiveTape | null }) {
  const live = useLiveTape() ?? initial;

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
            <span style={{ color: tone("muted") }}>{t.v}</span>
            <span style={{ color: tone(t.tone) }}>{t.chg}</span>
            <i>/</i>
          </div>
        ))}
      </div>
    </section>
  );
}
