import type { Metadata } from "next";
import { Funnel_Display, Funnel_Sans, IBM_Plex_Mono } from "next/font/google";
import "@/styles/globals.css";
import { themeScript } from "@/shared/lib/theme";
import { ToastProvider } from "@/shared/components/ui/toast";

/* Funnel Display para títulos y Funnel Sans para el texto: misma familia, sobria y poco vista. */
const display = Funnel_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const text = Funnel_Sans({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Criba", template: "%s | Criba" },
  description: "Ranking de candidatos con evidencia, no con palabras clave.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${text.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica el tema guardado antes de pintar, para que el modo oscuro no parpadee. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
