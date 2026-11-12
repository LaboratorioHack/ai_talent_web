import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/shared/components/layout";
import { Logo } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import Link from "next/link";

/**
 * Páginas del candidato: sin barra de la empresa ni sesión. Arriba la marca;
 * abajo, en una línea, qué hacemos con sus datos.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col [--app-header:64px]">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={routes.portalJobs} aria-label="Vacantes">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href={routes.portal} className="inline-flex h-9 items-center rounded-full px-3.5 text-[13.5px] font-medium text-ink-2 ring-1 ring-border transition-[color,box-shadow] hover:text-ink hover:ring-border-strong">
              Mi portal
            </Link>
            <ThemeToggle />
          </div>
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
