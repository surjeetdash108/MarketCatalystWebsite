// MarketCatalyst brand mark — ported verbatim from MarketCatalystUI's shell
// (ascending bar-chart + trend line + node, plus the "Market" / "Catalyst"
// wordmark). Static gradient id (no useId) so it renders in both server and
// client components; only one instance appears per admin page.
export function BrandLogo({ height = 26, showWord = true }: { height?: number; showWord?: boolean }) {
  const gid = "mc-brand-grad";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: Math.round(height * 0.3), lineHeight: 1 }}>
      <svg viewBox="0 0 44 44" width={height} height={height} aria-hidden="true" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id={gid} x1="4" y1="40" x2="40" y2="4" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2fe6a6" />
            <stop offset="0.5" stopColor="#38d6e6" />
            <stop offset="1" stopColor="#5b8cff" />
          </linearGradient>
        </defs>
        <rect x="5" y="27" width="6" height="12" rx="2" fill={`url(#${gid})`} />
        <rect x="14" y="21" width="6" height="18" rx="2" fill={`url(#${gid})`} />
        <rect x="23" y="15" width="6" height="24" rx="2" fill={`url(#${gid})`} />
        <rect x="32" y="9" width="6" height="30" rx="2" fill={`url(#${gid})`} />
        <path d="M7 30 L16 23 L25 17 L35 8" fill="none" stroke={`url(#${gid})`} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="35" cy="8" r="3.6" fill="#0b0f16" stroke={`url(#${gid})`} strokeWidth="2.4" />
      </svg>
      {showWord && (
        <span
          style={{
            fontFamily: "var(--f-display), system-ui, sans-serif",
            fontWeight: 800,
            fontSize: Math.round(height * 0.68),
            letterSpacing: "-0.02em",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "var(--text-hi)" }}>Market</span>
          <span className="brand-word-grad">Catalyst</span>
        </span>
      )}
    </span>
  );
}
