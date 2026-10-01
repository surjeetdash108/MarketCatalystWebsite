// ============================================================
// SCREENER WORKSPACE — candlestick + volume mock
// ============================================================
// The Screener panel's window used to show the same generic table every
// other panel shows. That flattened its one genuinely different feature —
// every match opens straight into its own chart — into another row of
// numbers. This renders that chart instead: a deterministic candlestick +
// volume plot keyed to whichever result is picked, generated with the same
// seeded PRNG the rest of workspaces.ts uses (server/client parity). The
// figures are samples, never claimed real, so the caller blurs the whole
// chart the same way every other sample figure on the page is blurred.

import { hash, rng } from "./workspaces";

type Bar = { o: number; h: number; l: number; c: number; v: number };

/** Deterministic OHLCV series for one seed. Pure function of the string. */
function genBars(seed: string, n = 42): Bar[] {
  const r = rng(hash(seed));
  const base = 40 + r() * 260;
  const drift = (r() - 0.46) * 2.6;
  const out: Bar[] = [];
  let p = base;
  for (let i = 0; i < n; i++) {
    const o = p;
    const ch = (r() - 0.5) * 3.4 + drift;
    const c = Math.max(2, o * (1 + ch / 100));
    const hi = Math.max(o, c) * (1 + (r() * 1.1) / 100);
    const lo = Math.min(o, c) * (1 - (r() * 1.1) / 100);
    const v = 0.22 + r() * 0.78 + (Math.abs(ch) > 2.4 ? 0.6 : 0);
    out.push({ o, h: hi, l: lo, c, v });
    p = c;
  }
  return out;
}

/** Candlestick + volume SVG, sized to fill its container. Sample data only. */
export function ScreenerChart({ seed }: { seed: string }) {
  const bars = genBars(seed);
  const n = bars.length;

  const W = 520;
  const axisW = 44;
  const padT = 8;
  const priceH = 150;
  const volGap = 10;
  const volH = 46;
  const H = padT + priceH + volGap + volH + 6;

  const mn = Math.min(...bars.map((b) => b.l));
  const mx = Math.max(...bars.map((b) => b.h));
  const rng_ = mx - mn || 1;
  const plotW = W - axisW - 6;
  const cw = plotW / n;
  const X = (i: number) => 4 + i * cw + cw / 2;
  const Y = (p: number) => padT + priceH * (1 - (p - mn) / rng_);

  const maxV = Math.max(...bars.map((b) => b.v)) || 1;
  const avgV = bars.reduce((s, b) => s + b.v, 0) / n;
  const volTop = padT + priceH + volGap;
  const VY = (v: number) => volTop + volH * (1 - v / maxV);
  const ww = Math.max(1.1, cw * 0.6);

  // Batched path definitions to eliminate 120+ DOM nodes and reduce nesting depth
  const gridPath = [0, 1, 2, 3, 4]
    .map((g) => {
      const yy = (padT + (priceH * g) / 4).toFixed(1);
      return `M2 ${yy}H${(W - axisW).toFixed(1)}`;
    })
    .join(" ");

  let upWicks = "";
  let upBodies = "";
  let upVols = "";
  let dnWicks = "";
  let dnBodies = "";
  let dnVols = "";

  for (let i = 0; i < n; i++) {
    const b = bars[i];
    const x = X(i);
    const isUp = b.c >= b.o;
    const xStr = x.toFixed(1);
    const yhStr = Y(b.h).toFixed(1);
    const ylStr = Y(b.l).toFixed(1);
    const wick = `M${xStr} ${yhStr}V${ylStr} `;

    const bt = Y(Math.max(b.o, b.c));
    const bb = Y(Math.min(b.o, b.c));
    const rx = (x - ww / 2).toFixed(1);
    const ry = bt.toFixed(1);
    const rw = ww.toFixed(1);
    const rh = Math.max(1, bb - bt).toFixed(1);
    const body = `M${rx} ${ry}h${rw}v${rh}h-${rw}Z `;

    const vy = VY(b.v);
    const vh = Math.max(1, volTop + volH - vy).toFixed(1);
    const vol = `M${rx} ${vy.toFixed(1)}h${rw}v${vh}h-${rw}Z `;

    if (isUp) {
      upWicks += wick;
      upBodies += body;
      upVols += vol;
    } else {
      dnWicks += wick;
      dnBodies += body;
      dnVols += vol;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      height="100%"
      className="mc-scr-canvas mc-blur"
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <path d={gridPath} stroke="var(--mc-line)" strokeWidth={1} />
      {[0, 1, 2, 3, 4].map((g) => {
        const yy = padT + (priceH * g) / 4;
        const val = mx - (rng_ * g) / 4;
        return (
          <text
            key={g}
            x={W - axisW + 4}
            y={yy + 3}
            fill="var(--mc-text-2)"
            fontSize={9}
            fontFamily="var(--mc-font-mono)"
          >
            ${val.toFixed(val > 100 ? 0 : 2)}
          </text>
        );
      })}

      {upWicks && <path d={upWicks} stroke="var(--mc-up)" strokeWidth={1} />}
      {upBodies && <path d={upBodies} fill="var(--mc-up)" />}
      {dnWicks && <path d={dnWicks} stroke="var(--mc-down)" strokeWidth={1} />}
      {dnBodies && <path d={dnBodies} fill="var(--mc-down)" />}

      <line
        x1={2}
        x2={W - axisW}
        y1={VY(avgV)}
        y2={VY(avgV)}
        stroke="var(--mc-text-faint)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />

      {upVols && <path d={upVols} fill="var(--mc-up)" opacity={0.55} />}
      {dnVols && <path d={dnVols} fill="var(--mc-down)" opacity={0.55} />}
    </svg>
  );
}
