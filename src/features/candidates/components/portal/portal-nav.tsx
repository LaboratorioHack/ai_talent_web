"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, LogOut } from "lucide-react";
import { Avatar, Logo, Popover } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";

const LINKS = [
  { href: routes.portal, label: "Mis postulaciones", match: (p: string) => p === routes.portal || p.startsWith("/portal/applications") },
  { href: routes.portalJobs, label: "Vacantes", match: (p: string) => p.startsWith(routes.portalJobs) },
  { href: routes.portalResume, label: "Mi hoja de vida", match: (p: string) => p.startsWith(routes.portalResume) },
];

/** Barra del portal del postulante: tres secciones y la cuenta. Las secciones se marcan con un subrayado ámbar. */
export function PortalNav({ name, email }: { name: string; email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href={routes.portal} aria-label="Mis postulaciones">
            <Logo />
          </Link>
          <nav aria-label="Portal" className="hidden h-16 items-stretch gap-6 md:flex">
            {LINKS.map((l) => {
              const on = l.match(pathname);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "relative flex items-center text-[14px] transition-colors duration-300",
                    on ? "text-ink" : "text-ink-3 hover:text-ink",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:rounded-full after:bg-amber after:transition-transform after:duration-500 after:ease-[var(--ease-out-soft)]",
                    on ? "after:scale-x-100" : "after:scale-x-0",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Popover
          label={`Cuenta de ${name}`}
          width={250}
          triggerClassName="flex items-center gap-2.5 rounded-full py-1 pr-1 pl-3 text-[13.5px] text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          trigger={
            <>
              <span className="hidden sm:inline">{name.split(" ")[0]}</span>
              <Avatar name={name} size={32} className="bg-amber text-[#1a211d]" />
            </>
          }
        >
          {(close) => (
            <div className="flex flex-col">
              <div className="border-b border-border px-4 py-3.5">
                <p className="truncate text-[14px] font-semibold">{name}</p>
                <p className="truncate text-xs text-ink-3">{email}</p>
              </div>
              <div className="flex flex-col p-1.5">
                <Link href={routes.portalResume} onClick={close} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-ink-2 transition-colors hover:bg-hover hover:text-ink">
                  <FileText aria-hidden className="size-4" />
                  Mi hoja de vida
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    router.push(routes.portalSignIn);
                  }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] text-ink-2 transition-colors hover:bg-hover hover:text-ink"
                >
                  <LogOut aria-hidden className="size-4" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </Popover>
      </div>

      <nav aria-label="Portal" className="flex gap-5 overflow-x-auto border-t border-border px-4 md:hidden">
        {LINKS.map((l) => {
          const on = l.match(pathname);
          return (
            <Link key={l.href} href={l.href} aria-current={on ? "page" : undefined} className={cn("shrink-0 border-b-2 py-3 text-[13.5px]", on ? "border-amber text-ink" : "border-transparent text-ink-3")}>
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
