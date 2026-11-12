import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

// Landing pública de Criba. Estática; la construye el Dockerfile de la app y queda en public/landing.
export default defineConfig({
  site: process.env.SITE_URL ?? "https://app.criba.isroot.in",
  // Vive dentro de la app Next: sus archivos se sirven en /landing y Next reescribe "/" a /landing/index.html.
  base: "/landing",
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
});
