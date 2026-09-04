"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/admin/BrandLogo";
import { BlogThemeProvider, useBlogTheme } from "./theme-context";
// Scoped to an ARTICLE page, not to /posts. The index page carries its own template
// (header, masthead, footer) and would have rendered inside a second header
// otherwise; the ARTICLE page is what wants this shell.
//
// Reuse the app's dark surface + the admin table/panel classes so the public
// blog matches the /admin/posts look. admin.css is scoped under .iq-root, so
// importing it here only affects this subtree.
import "../admin/admin.css";

/* Neutral WHITE light palette for the article page.
   Was the board's warm off-white (#f4f0e8). That cream is right for the board,
   which is a designed index of cards — but an article page is a ground for
   someone else's document, and a warm tint behind a design drawn on white read
   as a mistake, not a choice. Applies to the ARTICLE routes only
   (/posts/[slug], /posts/view); the board keeps its own palette. */
const LIGHT_VARS: React.CSSProperties = {
  colorScheme: "light",
  ["--bg" as string]: "#ffffff",
  ["--surface-0" as string]: "#f7f7f8",
  ["--surface-1" as string]: "#ffffff",
  ["--surface-2" as string]: "#f4f4f5",
  ["--border" as string]: "#e6e6e9",
  ["--border-soft" as string]: "#efeff1",
  ["--border-strong" as string]: "#d4d4d8",
  ["--text-hi" as string]: "#18181b",
  ["--text" as string]: "#3f3f46",
  ["--text-dim-solid" as string]: "#71717a",
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
  const light = theme === "light";
  return (
    <div
      className="iq-root"
      data-theme={theme}
      style={{
        minHeight: "100vh", height: "auto", overflow: "visible",
        background: "var(--bg)", color: "var(--text)",
        ...(light ? LIGHT_VARS : DARK_VARS),
      } as React.CSSProperties}
    >
      <header
        style={{
          display: "flex", alignItems: "center", gap: 16,
          padding: "16px 26px", borderBottom: "1px solid var(--border)",
          position: "sticky", top: 0, zIndex: 10,
          background: "color-mix(in srgb, var(--bg) 92%, transparent)",
          backdropFilter: "blur(8px)",
          flexWrap: "wrap",
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

export default function ArticleShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <BlogThemeProvider>
      <PostsShell>{children}</PostsShell>
    </BlogThemeProvider>
  );
}
