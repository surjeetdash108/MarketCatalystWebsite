// Ported from MarketCatalystUI's `app/iq/utils.tsx`, trimmed to the plain
// formatting helpers the carousel thumbnails actually call.

export function fmt(n: number, d = 2): string {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  return n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function sign(n: number): string {
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

export function cls(n: number): string {
  return n > 0 ? "up" : n < 0 ? "down" : "flat";
}

// ---- Heatmap color (matches HTML heatCol) ----
export function heatCol(p: number): { bg: string; fg: string } {
  const a = Math.min(Math.abs(p) / 3, 1);
  const L = (x: number, y: number) => Math.round(x + (y - x) * a);
  let r: number, g: number, b: number;
  if (p >= 0) {
    r = L(206, 8);
    g = L(240, 120);
    b = L(220, 62);
  } else {
    r = L(250, 168);
    g = L(214, 12);
    b = L(222, 32);
  }
  return { bg: `rgb(${r},${g},${b})`, fg: a > 0.42 ? "#ffffff" : "#0c1a13" };
}
