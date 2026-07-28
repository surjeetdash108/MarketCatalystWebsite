// Fear & Greed gauge SVG (matches the HTML product's gaugeSVG helper).
export function GaugeSVG({ val }: { val: number }) {
  const a = Math.PI * (1 - val / 100),
    cx = 70,
    cy = 66,
    r = 54;
  const x = cx + r * Math.cos(a),
    y = cy - r * Math.sin(a);
  return (
    <svg viewBox="0 0 140 78" width="150">
      <defs>
        <linearGradient id="gfg" x1="0" x2="1">
          <stop offset="0" stopColor="#FF5470" />
          <stop offset=".5" stopColor="#FFB547" />
          <stop offset="1" stopColor="#2FE6A6" />
        </linearGradient>
      </defs>
      <path d="M16 66 A54 54 0 0 1 124 66" fill="none" stroke="var(--surface-3)" strokeWidth="11" strokeLinecap="round" />
      <path
        d="M16 66 A54 54 0 0 1 124 66"
        fill="none"
        stroke="url(#gfg)"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="170"
        strokeDashoffset={170 - (170 * val) / 100}
      />
      <circle cx={x} cy={y} r="6" fill="var(--text-hi)" stroke="var(--bg)" strokeWidth="3" />
    </svg>
  );
}
