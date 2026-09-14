"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/admin/BrandLogo";
// Same shell as /faqs and /posts so the legal pages are visibly part of the
// site rather than a bare document. admin.css is scoped under .iq-root, so
// importing it here only affects this subtree.
import "../admin/admin.css";

// The blog/FAQ light palette, so light mode matches the rest of the public site.
const LIGHT_VARS: React.CSSProperties = {
  colorScheme: "light",
  ["--bg" as string]: "#f4f0e8",
  ["--surface-0" as string]: "#ece7dd",
  ["--surface-1" as string]: "#fffdf9",
  ["--surface-2" as string]: "#f3eee6",
  ["--border" as string]: "#ded6c8",
  ["--border-soft" as string]: "#e6e0d5",
  ["--border-strong" as string]: "#c9bfae",
  ["--text-hi" as string]: "#1e1813",
  ["--text" as string]: "#3a3129",
  ["--text-dim-solid" as string]: "#6a5f55",
};

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const light = theme === "light";

  return (
    <div
      className="iq-root"
      data-theme={theme}
      style={{
        minHeight: "100vh", height: "auto", overflow: "visible",
        background: "var(--bg)", color: "var(--text)",
        ...(light ? LIGHT_VARS : {}),
      } as React.CSSProperties}
    >
      <header
        style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "16px 26px", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, zIndex: 10,
          background: "color-mix(in srgb, var(--bg) 92%, transparent)",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link href="/" style={{ display: "inline-flex" }} aria-label="MarketCatalyst home">
          <BrandLogo height={24} />
        </Link>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
          <Link href="/" className="hw-ghost">Home</Link>
          <Link href="/faqs" className="hw-ghost">FAQs</Link>
          <button
            type="button"
            onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
            aria-pressed={!light}
            aria-label="Toggle light/dark theme"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer",
              fontWeight: 600, fontSize: 12.5, color: "var(--text-dim-solid)",
              background: "var(--surface-1)", border: "1px solid var(--border)",
              borderRadius: 30, padding: "8px 14px",
            }}
          >
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%",
                background: light ? "#6fb58c" : "#e3b255", display: "inline-block",
              }}
            />
            {light ? "Dark" : "Light"}
          </button>
        </nav>
      </header>
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "28px 22px 80px" }}>
        {children}
      </main>
    </div>
  );
}
