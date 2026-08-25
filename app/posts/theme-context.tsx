"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type BlogTheme = "light" | "dark";

// Shared light/dark state for the whole /posts subtree, so the blog board's
// toggle themes the ENTIRE page (layout header + background) — not just the
// board content. Without this the layout was hardcoded light, leaving the page
// header and the area below the board light while the board went dark.
const BlogThemeCtx = createContext<{ theme: BlogTheme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

export const useBlogTheme = () => useContext(BlogThemeCtx);

export function BlogThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<BlogTheme>("light");
  return (
    <BlogThemeCtx.Provider value={{ theme, toggle: () => setTheme((t) => (t === "light" ? "dark" : "light")) }}>
      {children}
    </BlogThemeCtx.Provider>
  );
}
