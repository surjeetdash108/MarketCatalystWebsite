import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored at build time from pdfjs-dist (scripts/copy-pdf-worker.mjs).
    // It is minified third-party code: linting it buries real findings under
    // ~1,500 warnings about its own source.
    "public/pdfjs/**",
  ]),
]);

export default eslintConfig;
