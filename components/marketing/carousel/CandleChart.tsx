// Deterministic candlestick chart used by the Stock Detail / Portfolio
// thumbnails. Ported verbatim from MarketCatalystUI's `app/page.tsx`
// (the marquee's local candle-chart implementation, distinct from the
// dashboard app's `iq/utils.tsx` CandleChart).

// Seeded PRNG — matches HTML's _seed/_hash
function sdHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h * 31 + s.charCodeAt(i)) | 0) & 0x7fffffff;
  return h;
}
function sdRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// Deterministic OHLC — matches HTML's genOHLC(sym, tf)
export function genOHLC(sym: string, tf: string, price: number, chgPct: number, rs: number) {
  const C: Record<string, [number, number]> = {
    "1D": [78, 0.5], "1W": [65, 0.9], "1M": [44, 1.5],
    "3M": [64, 1.1], "6M": [120, 1.3], "1Y": [252, 1.8], "5Y": [260, 2.6],
  };
  const [n, volat] = C[tf] ?? [64, 1.1];
  const bias = (chgPct >= 0 ? 1 : -1) * (0.12 + Math.abs(rs - 50) / 140);
  const rnd = sdRand(sdHash(sym + tf) + 7);
  let p = price * (tf === "5Y" ? 0.32 : tf === "1Y" ? 0.6 : 0.86);
  const out: { o: number; h: number; l: number; c: number; v: number }[] = [];
  for (let i = 0; i < n; i++) {
    const o = p;
    const ch = (rnd() - 0.5) * volat * 2 + bias * volat * 0.9;
    const c = Math.max(0.5, o * (1 + ch / 100));
    const hi = Math.max(o, c) * (1 + (rnd() * volat) / 160);
    const lo = Math.min(o, c) * (1 - (rnd() * volat) / 160);
    const v = 0.5 + rnd() * 0.7 + (Math.abs(ch) > volat ? 0.9 : 0);
    out.push({ o, h: hi, l: lo, c, v });
    p = c;
  }
  const k = price / out[out.length - 1].c;
  out.forEach((d) => {
    d.o *= k;
    d.h *= k;
    d.l *= k;
    d.c *= k;
  });
  return out;
}

// Candlestick chart SVG — matches HTML's candleChart()
export function CandleChart({ data }: { data: ReturnType<typeof genOHLC> }) {
  const d = data,
    n = d.length;
  const W = 720, PH = 224, PADT = 12, PADB = 18, axisW = 46, H = PADT + PH + PADB;
  const mn = Math.min(...d.map((x) => x.l)),
    mx = Math.max(...d.map((x) => x.h)),
    rng = mx - mn || 1;
  const plotW = W - axisW - 8,
    cw = plotW / n;
  const X = (i: number) => 6 + i * cw + cw / 2;
  const Y = (p: number) => PADT + PH * (1 - (p - mn) / rng);
  const ei = Math.round(n * 0.82);
  const ex = X(ei),
    ey = Y(d[ei].h) - 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }}>
      {[0, 1, 2, 3, 4].map((g) => {
        const yy = PADT + (PH * g) / 4,
          val = mx - (rng * g) / 4;
        return (
          <g key={g}>
            <line x1={6} x2={W - axisW} y1={yy} y2={yy} stroke="var(--border-soft)" strokeWidth={1} />
            <text x={W - axisW + 4} y={yy + 3} fill="#697486" fontSize={9} fontFamily="var(--f-mono)">
              ${val > 500 ? Math.round(val).toLocaleString() : val.toFixed(2)}
            </text>
          </g>
        );
      })}
      {d.map((bar, i) => {
        const x = X(i),
          isUp = bar.c >= bar.o,
          col = isUp ? "var(--up)" : "var(--down)";
        const bt = Y(Math.max(bar.o, bar.c)),
          bb = Y(Math.min(bar.o, bar.c)),
          ww = Math.max(1.2, cw * 0.62);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={Y(bar.h)} y2={Y(bar.l)} stroke={col} strokeWidth={1} />
            <rect x={x - ww / 2} y={bt} width={ww} height={Math.max(1, bb - bt)} fill={col} stroke={col} strokeWidth={1} />
          </g>
        );
      })}
      <circle cx={ex} cy={ey} r={4} fill="var(--ai)" />
      <text x={ex} y={ey - 6} textAnchor="middle" fill="var(--ai)" fontSize={9} fontFamily="var(--f-mono)">
        ◆ ER
      </text>
    </svg>
  );
}
