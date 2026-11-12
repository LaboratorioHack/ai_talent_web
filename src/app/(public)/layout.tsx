import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

/**
 * Páginas del candidato sin sesión (vacante, postulación, entrevista): el
 * mismo verde oscuro del portal y la landing.
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dark-scope flex min-h-dvh flex-1 flex-col bg-bg [--app-header:64px]">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={routes.portalJobs} aria-label="Vacantes">
            <Logo />
          </Link>
          <Link href={routes.portal} className="text-[14px] text-ink-2 transition-colors hover:text-ink">
            Mis postulaciones
          </Link>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
