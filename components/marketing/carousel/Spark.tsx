// Tiny sparkline SVG for thumbnails — deterministic from `idx`, purely decorative.
export function Spark({ idx, up }: { idx: number; up: boolean }) {
  const pts = [40, 44, 41, 47, 43, 50, 46, 53, 49, 55, 51, 58, 54, 60, 57, 62, 55, 65, 60, 67, 63, 70, 61, 68, 66, 72];
  const phase = idx * 3;
  const data = pts.map((_, i) => pts[(i + phase) % pts.length]);
  const W = 72, H = 22;
  const mn = Math.min(...data), mx = Math.max(...data), range = mx - mn || 1;
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (data.length - 1)) * W},${H - ((v - mn) / range) * H}`).join(" ");
  const col = up ? "#22c55e" : "#f43f5e";
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={col} strokeWidth="1.6" />
    </svg>
  );
}
