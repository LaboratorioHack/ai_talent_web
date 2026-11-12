import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Landing pública de Criba. Estática; la construye el Dockerfile de la app y queda en public/landing.
export default defineConfig({
  // Dominio raíz de la landing (la app vive en app.criba.isroot.in).
  site: process.env.SITE_URL ?? "https://criba.isroot.in",
  // Se empaqueta en la imagen de la app (public/landing); Caddy sirve "/" del dominio raíz
  // con /landing/index.html y sus archivos bajo /landing.
  base: "/landing",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
