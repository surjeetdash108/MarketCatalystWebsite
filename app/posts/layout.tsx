import Link from "next/link";
import { BrandLogo } from "@/components/admin/BrandLogo";
// Reuse the app's dark surface + the admin table/panel classes so the public
// blog matches the /admin/posts look. admin.css is scoped under .iq-root, so
// importing it here only affects this subtree.
import "../admin/admin.css";

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  // height:auto + overflow:visible override iq.css's fixed `.iq-root` shell
  // (height:100vh; overflow:hidden) so this content page scrolls on the body;
  // the sticky header still sticks to the viewport top.
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
          <Link href="/" className="hw-ghost">Home</Link>
          <Link href="/posts" className="hw-ghost">Blogs</Link>
          <Link href="/faqs" className="hw-ghost">FAQs</Link>
        </nav>
      </header>
      <main style={{ width: "100%", padding: "28px clamp(18px, 5vw, 72px) 80px" }}>
        {children}
      </main>
    </div>
  );
}
