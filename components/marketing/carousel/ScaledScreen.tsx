"use client";

import { useEffect, useRef, useState } from "react";

// Content is authored at 1200px virtual width then CSS-scaled to fill
// whatever container it lives in (carousel card ~340px, glance modal
// ~572px, mobile stacked ~320px, etc.)
export function ScaledScreen({ children }: { children: React.ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2834); // initial guess for 340px card

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setScale(e.contentRect.width / 1200);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={outerRef} style={{ position: "absolute", inset: 0, overflow: "hidden", background: "var(--surface-0)" }}>
      <div style={{ width: 1200, minHeight: 1567, transformOrigin: "top left", transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
