export function LogoMark({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
      <path d="M3 17l5-6 4 4 6-9" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="20" cy="5.5" r="2.4" fill="#fff" />
    </svg>
  );
}
