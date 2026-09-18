"use client";

import { hud, hudRead, tone, type Hud } from "./data";
import { useLiveTape } from "./live-tape";

/**
 * The hero's tape snapshot — S&P, gold, VIX and crude.
 *
 * Renders the designed figures on the server, then swaps in the real ones once
 * the live tape answers. The swap is per-cell and by key, so a partial frame
 * (gold missing, say) still upgrades the three cells it can and leaves the
 * fourth alone rather than blanking it.
 *
 * The strip underneath moves with the numbers. Its designed copy is editorial
 * — "gold catching the haven bid" — which is fine beside designed figures and
 * wrong beside live ones the moment gold ticks down, so when real data arrives
 * the read is generated from that same frame instead.
 */
export function HeroHud() {
  const live = useLiveTape();

  const byKey = new Map((live?.cells ?? []).map((c) => [c.k, c]));
  const cells: Hud[] = hud.map((h) => {
    const l = byKey.get(h.k);
    return l ? { ...h, v: l.v, chg: l.chg, arrow: l.arrow, tone: l.tone, w: l.w, note: l.note } : h;
  });

  const isLive = byKey.size > 0;

  return (
    <div className="mc-hud">
      <div className="mc-hud-head">
        <i />
        <span>Tape snapshot</span>
        {/* Once the figures are real, say what they actually are. The feed is
            vendor-delayed and the market is often shut; claiming "live" in
            either case would be a lie told in 9px type. */}
        <span title={isLive ? live?.delayNote : undefined}>
          {isLive ? `US · ${phaseLabel(live!.phase, live!.stale)}` : "US · live"}
        </span>
      </div>

      <div className="mc-hud-grid">
        {cells.map((h) => (
          <div className="mc-hud-cell" key={h.k}>
            <div className="mc-hud-k">
              <span>{h.k}</span>
              <span style={{ color: tone(h.tone) }}>{h.arrow}</span>
            </div>
            <div className="mc-hud-v">
              {/* Drift is a decoration for figures that are standing still.
                  Real ones move on their own, so it is switched off. */}
              <b data-drift={isLive ? 0 : h.drift}>{h.v}</b>
              <span style={{ color: tone(h.tone) }}>{h.chg}</span>
            </div>
            <div className="mc-hud-bar">
              <i style={{ width: h.w, background: tone(h.tone) }} />
            </div>
            <div className="mc-hud-note">{h.note}</div>
          </div>
        ))}
      </div>

      <div className="mc-hud-foot" aria-live="polite">
        <i>◆</i>
        <span>{isLive ? live!.read : hudRead}</span>
      </div>
    </div>
  );
}

/** What the tape is doing, in the two or three words the header has room for. */
function phaseLabel(phase: string, stale: boolean): string {
  if (stale) return "last close";
  if (phase === "open") return "15m delayed";
  if (phase === "pre") return "pre-market";
  if (phase === "after") return "after hours";
  if (phase === "closed") return "closed";
  return "delayed";
}
