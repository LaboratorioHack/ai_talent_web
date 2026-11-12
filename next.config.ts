import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

const apiOrigin = apiUrl.startsWith("http") ? new URL(apiUrl).origin : "";
const connectSrc = ["'self'", supabaseUrl, apiOrigin].filter(Boolean).join(" ");

// OWASP A05 (Injection/XSS) + A02 (Misconfiguration).
// Nonce-based CSP is incompatible with cacheComponents/PPR, so this is the "without nonces"
// variant from node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md.
// HSTS, nosniff and Referrer-Policy are set once at the edge (deploy/Caddyfile in ai_talent_back).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self'",
  `connect-src ${connectSrc}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // La landing (carpeta landing/, Astro) se construye en el Dockerfile dentro de public/landing.
  // Quien la muestra en "/" es Caddy, solo en el dominio raíz (criba.isroot.in); en la app
  // (app.criba.isroot.in) "/" lleva a /home. Ver ai_talent_back/deploy/Caddyfile.
  // En local la API (.NET) no tiene CORS: el navegador llama a "/api" en el mismo origen y Next lo
  // reenvía. En producción Caddy atiende /api/* antes de llegar aquí, así que esto no se usa.
  async rewrites() {
    const internal = process.env.API_INTERNAL_URL;
    return internal ? [{ source: "/api/:path*", destination: `${internal}/:path*` }] : [];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
