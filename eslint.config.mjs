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
    // La landing (Astro) tiene su propio build y su propio check.
    "landing/**",
    // Worker de pdf.js copiado de pdfjs-dist (minificado, no es código nuestro).
    "public/pdf.worker.min.mjs",
  ]),
]);

export default eslintConfig;
