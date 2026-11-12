import type { ReactNode } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";
import { ThemeToggle } from "@/shared/components/layout";
import { Logo } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

/**
 * Páginas del candidato sin sesión (vacante, postulación, entrevista,
 * entrada al portal): la misma luz y contornos del portal.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="portal-light flex min-h-dvh flex-1 flex-col [--app-header:68px]">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={routes.portalJobs} aria-label="Vacantes" className="flex items-center gap-2.5">
            <Logo size="lg" />
            <span className="hidden rounded-md bg-amber px-1.5 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-[#1a211d] uppercase sm:inline">Postulantes</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={routes.portal} className="group inline-flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-[14px] font-medium ring-1 ring-border transition-[box-shadow,transform,translate] duration-300 hover:-translate-y-px hover:shadow-[0_10px_24px_-14px_rgba(0,0,0,0.5)]">
              <Inbox aria-hidden className="size-4 text-amber transition-transform duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6" />
              Mis postulaciones
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
