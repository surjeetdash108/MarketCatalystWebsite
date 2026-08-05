import Link from "next/link";
import { BrandLogo } from "@/components/admin/BrandLogo";
// Same dark surface + admin table/panel classes as /posts, so the public FAQ
// pages match the /admin/faqs look. admin.css is scoped under .iq-root, so
// importing it here only affects this subtree.
import "../admin/admin.css";

export default function FaqsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="iq-root" data-theme="dark" style={{ minHeight: "100vh", height: "auto", overflow: "visible", background: "var(--bg)", color: "var(--text)" }}>
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
          <Link href="/" style={{ color: "var(--text-dim-solid)", fontSize: ".88rem" }}>Home</Link>
          <Link href="/posts" style={{ color: "var(--text-dim-solid)", fontSize: ".88rem" }}>Blogs</Link>
          <Link href="/faqs" style={{ color: "var(--text-hi)", fontSize: ".88rem", fontWeight: 600 }}>FAQs</Link>
        </nav>
      </header>
      <main style={{ maxWidth: 960, margin: "0 auto", padding: "28px 22px 80px" }}>
        {children}
      </main>
    </div>
  );
}
