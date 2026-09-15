import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig, globalIgnores } from "eslint/config";

// eslint-config-next 15.x ships eslintrc-format config only (flat-config
// support landed later, alongside Next 16) - bridge it the same way
// create-next-app scaffolds for Next 15.x projects.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = defineConfig([
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
