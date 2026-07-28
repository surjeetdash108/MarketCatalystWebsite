// EPS beat/miss history chart + its seeded generator, ported from the
// marquee's local implementation in MarketCatalystUI's `app/page.tsx`.

function erH(s: string, i: number): number {
  return (Math.abs(s.charCodeAt(0) * 31 + (s.charCodeAt(1) || 7) * 17 + i * 13) % 97) / 97;
}

export type EarnQ = { q: string; e: number; a: number; surp: number; mv: number };

export function earnHistory(sym: string, price: number, pe: number): EarnQ[] {
  const base = Math.max(0.05, price / (pe || 25) / 4);
  const qs = ["Q2 25", "Q1 25", "Q4 24", "Q3 24", "Q2 24", "Q1 24", "Q4 23", "Q3 23", "Q2 23", "Q1 23"];
  return qs.map((q, i) => {
    const r = erH(sym, i);
    const e = parseFloat((base * (1 - i * 0.03)).toFixed(2));
    const surp = parseFloat(((r - 0.4) * 18).toFixed(1));
    const a = parseFloat((e * (1 + surp / 100)).toFixed(2));
    const mv = parseFloat(((r - 0.45) * 22).toFixed(1));
    return { q, e, a, surp, mv };
  });
}

export function EarnEpsChart({ hist }: { hist: EarnQ[] }) {
  const d = [...hist].reverse();
  const W = 580, H = 210, PADL = 30, PADR = 18, PADT = 14, PADB = 30;
  const iw = W - PADL - PADR, ih = H - PADT - PADB;
  const maxE = (Math.max(...d.map((x) => Math.max(x.e, x.a))) || 1) * 1.15;
  const maxM = Math.max(1, ...d.map((x) => Math.abs(x.mv)));
  const n = d.length, gw = iw / n, bw = gw * 0.28;
  const mid = PADT + ih / 2;
  const linePts = d
    .map((x, i) => {
      const cx = PADL + gw * i + gw / 2;
      const my = mid - (x.mv / maxM) * (ih / 2 - 8);
      return `${i === 0 ? "M" : "L"}${cx.toFixed(1)} ${my.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block" }}>
      <line x1={PADL} y1={mid} x2={W - PADR} y2={mid} stroke="var(--border)" strokeDasharray="3 3" />
      {d.map((x, i) => {
        const cx = PADL + gw * i + gw / 2;
        const eh = (x.e / maxE) * ih,
          ah = (x.a / maxE) * ih;
        const ex = cx - bw - 2,
          ax = cx + 2;
        const my = mid - (x.mv / maxM) * (ih / 2 - 8);
        return (
          <g key={i}>
            <rect x={ex.toFixed(1)} y={(PADT + ih - eh).toFixed(1)} width={bw.toFixed(1)} height={eh.toFixed(1)} rx={2} fill="var(--surface-3)" />
            <rect
              x={ax.toFixed(1)}
              y={(PADT + ih - ah).toFixed(1)}
              width={bw.toFixed(1)}
              height={ah.toFixed(1)}
              rx={2}
              fill={x.surp >= 0 ? "var(--up)" : "var(--down)"}
            />
            <circle cx={cx.toFixed(1)} cy={my.toFixed(1)} r={2.6} fill="var(--brand-2)" />
            {(i % 2 === 0 || i === n - 1) && (
              <text x={cx.toFixed(1)} y={H - 10} textAnchor="middle" fill="var(--text-dim-solid)" fontSize={9}>
                {x.q.replace(" ", "’")}
              </text>
            )}
          </g>
        );
      })}
      <path d={linePts} fill="none" stroke="var(--brand-2)" strokeWidth={1.6} />
    </svg>
  );
}
