"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/admin/BrandLogo";
import { BlogThemeProvider, useBlogTheme } from "./theme-context";
// Reuse the app's dark surface + the admin table/panel classes so the public
// blog matches the /admin/posts look. admin.css is scoped under .iq-root, so
// importing it here only affects this subtree.
import "../admin/admin.css";

// Warm off-white LIGHT palette (blog-board.css light theme) — overrides
// admin.css's cool/pure-white light tokens so the header + background match the
// blog board's off-white.
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

// Warm DARK palette mirroring the blog board's dark theme (blog-board.css
// `.mcb` defaults), mapped onto admin.css var names — so the whole page
// (header + background below the board) matches the board when dark.
const DARK_VARS: React.CSSProperties = {
  colorScheme: "dark",
  ["--bg" as string]: "#14110e",
  ["--surface-0" as string]: "#181310",
  ["--surface-1" as string]: "#1d1815",
  ["--surface-2" as string]: "#181310",
  ["--border" as string]: "#2c2520",
  ["--border-soft" as string]: "#2c2520",
  ["--border-strong" as string]: "#3e332b",
  ["--text-hi" as string]: "#fdf8f1",
  ["--text" as string]: "#ede5da",
  ["--text-dim-solid" as string]: "#a3958a",
};

function PostsShell({ children }: { children: React.ReactNode }) {
  const { theme } = useBlogTheme();
  const pathname = usePathname();
  const light = theme === "light";
  /**
   * An article reads on white; the board does not.
   *
   * The off-white is what makes /posts look like a front page — it is the
   * newsprint behind the cards. Behind a column of body copy it is just a tint,
   * and it fights any document the article carries: a PDF page and an html
   * post's own background are both white or near it, so the page showed a
   * lighter rectangle sitting on a darker one.
   *
   * Set here rather than on the article itself because the header is rendered
   * by this layout, above the page in the tree — a variable set further down
   * could not reach it, and the sticky header would keep the old tint while
   * the page under it went white.
   */
  const article = pathname?.startsWith("/posts/view") ?? false;
  const lightVars: React.CSSProperties = article
    ? { ...LIGHT_VARS, ["--bg" as string]: "#ffffff" }
    : LIGHT_VARS;
  return (
    <div
      className="iq-root"
      data-theme={theme}
      style={{
        minHeight: "100vh", height: "auto", overflow: "visible",
        background: "var(--bg)", color: "var(--text)",
        ...(light ? lightVars : DARK_VARS),
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
        {/* "Blogs" omitted — we're already on the blog page. Theme toggle lives
            in the blog board's masthead (shared via BlogThemeProvider). */}
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

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlogThemeProvider>
      <PostsShell>{children}</PostsShell>
    </BlogThemeProvider>
  );
}
