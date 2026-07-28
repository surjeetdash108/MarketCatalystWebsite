// Grouped bar chart for financials — matches HTML's earnIncChart(). Fixed
// demo figures (revenue / gross profit / net income), purely decorative.
export function EarnIncChart() {
  const inc = [
    { c: "Q2'25", rev: 44.1, gp: 32.2, ni: 24.3 },
    { c: "Q1'25", rev: 35.1, gp: 25.6, ni: 19.3 },
    { c: "Q4'24", rev: 26.1, gp: 19.1, ni: 14.4 },
    { c: "Q3'24", rev: 18.1, gp: 13.2, ni: 9.9 },
  ];
  const W = 380, H = 200, PADL = 8, PADR = 8, PADT = 14, PADB = 26;
  const iw = W - PADL - PADR, ih = H - PADT - PADB;
  const max = Math.max(...inc.map((x) => x.rev)) * 1.12;
  const n = inc.length, gw = iw / n, bw = gw * 0.2;
  const series: [keyof (typeof inc)[0], string][] = [
    ["rev", "var(--brand)"],
    ["gp", "var(--ai)"],
    ["ni", "var(--up)"],
  ];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: W, display: "block" }}>
      {inc.map((x, i) => {
        const gx = PADL + gw * i;
        return (
          <g key={i}>
            {series.map(([key, col], si) => {
              const v = x[key] as number,
                h = (v / max) * ih,
                bx = gx + gw * 0.16 + si * (bw + 5);
              return <rect key={si} x={bx} y={PADT + ih - h} width={bw} height={h} rx={2} fill={col} />;
            })}
            <text x={gx + gw / 2} y={H - 8} textAnchor="middle" fill="var(--text-dim-solid)" fontSize={9}>
              {x.c}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
