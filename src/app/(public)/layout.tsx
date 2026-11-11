import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/shared/components/layout";
import { Logo } from "@/shared/components/ui";

/**
 * Páginas del candidato: sin barra de la empresa ni sesión. Arriba la marca;
 * abajo, en una línea, qué hacemos con sus datos.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col [--app-header:64px]">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
      <footer className="border-t border-border">
        <p className="mx-auto flex w-full max-w-[1120px] items-start gap-2 px-4 py-5 text-[12.5px] text-ink-3 sm:px-6 lg:px-8">
          <ShieldCheck aria-hidden className="mt-px size-3.5 shrink-0" />
          Tu nombre y tu correo solo los ve la empresa. La IA nunca los recibe, y puedes pedir que borremos todos tus datos.
        </p>
      </footer>
    </div>
  );
}
