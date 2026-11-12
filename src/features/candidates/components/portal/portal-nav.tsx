"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, UserRound } from "lucide-react";
import { ThemeToggle } from "@/shared/components/layout";
import { Avatar, Logo, Popover } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";

const LINKS = [
  { href: routes.portal, label: "Inicio", exact: true },
  { href: routes.portalApplications, label: "Mis postulaciones" },
  { href: routes.portalJobs, label: "Vacantes" },
  { href: routes.portalProfile, label: "Mi perfil" },
];

/** Barra del portal del postulante: más simple que la de la empresa y con su propio menú. */
export function PortalNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (l: (typeof LINKS)[number]) => (l.exact ? pathname === l.href : pathname.startsWith(l.href));

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href={routes.portal} className="flex items-center gap-2.5" aria-label="Inicio del portal">
          <Logo />
          <span className="hidden rounded-full bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2 ring-1 ring-border sm:inline">Postulantes</span>
        </Link>

        <nav aria-label="Portal" className="hidden items-center gap-1 rounded-full bg-surface-2 p-1 ring-1 ring-border md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l) ? "page" : undefined}
              className={cn(
                "flex h-9 items-center rounded-full px-3.5 text-[14px] transition-[color,background-color,box-shadow] duration-300",
                isActive(l) ? "bg-surface font-medium text-ink shadow-[0_1px_2px_rgba(21,32,27,0.08)] ring-1 ring-border/60" : "text-ink-2 hover:text-ink",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Popover
            label={`Cuenta de ${name}`}
            width={260}
            triggerClassName="flex size-10 items-center justify-center rounded-full transition-[box-shadow] duration-300 hover:shadow-[0_0_0_3px_var(--surface-3)]"
            trigger={<Avatar name={name} size={36} className="bg-amber text-ink" />}
          >
            {(close) => (
              <div className="flex flex-col">
                <div className="border-b border-border px-4 py-3.5">
                  <p className="truncate text-[14px] font-semibold">{name}</p>
                  <p className="truncate text-xs text-ink-3">{email}</p>
                </div>
                <div className="flex flex-col p-1.5">
                  <Link href={routes.portalProfile} onClick={close} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-ink-2 transition-colors hover:bg-hover hover:text-ink">
                    <UserRound aria-hidden className="size-4" />
                    Mi perfil y datos
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      router.push(routes.portalSignIn);
                    }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] text-danger transition-colors hover:bg-hover"
                  >
                    <LogOut aria-hidden className="size-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </Popover>
        </div>
      </div>

      {/* Celular: las secciones en una fila que se desliza. */}
      <nav aria-label="Portal" className="flex gap-1 overflow-x-auto border-t border-border/60 px-3 py-2 md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={isActive(l) ? "page" : undefined}
            className={cn("shrink-0 rounded-full px-3 py-1.5 text-[13.5px]", isActive(l) ? "bg-surface font-medium text-ink ring-1 ring-border" : "text-ink-2")}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
