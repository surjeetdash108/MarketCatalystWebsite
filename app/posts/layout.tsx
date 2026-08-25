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
    <div
      className="iq-root"
      data-theme="light"
      style={{
        minHeight: "100vh", height: "auto", overflow: "visible",
        background: "var(--bg)", color: "var(--text)", colorScheme: "light",
        // Warm off-white palette from the blog board (blog-board.css light
        // theme) — overrides iq.css's cool/pure-white light tokens so the whole
        // blog experience (board + article view) uses the blog's off-white,
        // never pure white. Inline vars win over the stylesheet.
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
        {/* "Blogs" omitted — we're already on the blog page. */}
        <nav style={{ marginLeft: "auto", display: "flex", gap: 18, alignItems: "center" }}>
          <Link href="/" className="hw-ghost">Home</Link>
          <Link href="/faqs" className="hw-ghost">FAQs</Link>
        </nav>
      </header>
      {/* No padding here: the /posts board is full-bleed (owns its own padding);
          content pages like /posts/view add their own via .posts-page-pad. */}
      <main style={{ width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
