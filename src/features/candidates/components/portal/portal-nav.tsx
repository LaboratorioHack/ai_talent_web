"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FileText, Inbox, LogOut, Search, type LucideIcon } from "lucide-react";
import { ThemeToggle } from "@/shared/components/layout";
import { Avatar, Logo, Popover } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";

export interface PortalNavProps {
  name: string;
  email: string;
  /** Procesos en curso (contador de la primera pestaña). */
  active: number;
  /** Hay algo que la persona tiene que hacer (entrevista pendiente). */
  pending: boolean;
}

const LINKS: { href: string; label: string; icon: LucideIcon; match: (p: string) => boolean }[] = [
  { href: routes.portal, label: "Mis postulaciones", icon: Inbox, match: (p) => p === routes.portal || p.startsWith("/portal/applications") },
  { href: routes.portalJobs, label: "Vacantes", icon: Search, match: (p) => p.startsWith(routes.portalJobs) },
  { href: routes.portalResume, label: "Mi hoja de vida", icon: FileText, match: (p) => p.startsWith(routes.portalResume) },
];

/**
 * Barra del portal: pestañas con icono y una píldora que se desliza a la
 * activa; "Mis postulaciones" lleva el contador y late en ámbar si hay algo
 * pendiente. A la derecha, el tema y la cuenta.
 */
export function PortalNav({ name, email, active, pending }: PortalNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = useRef<HTMLElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const matched = LINKS.find((l) => l.match(pathname))?.href;
  // La pestaña tocada se marca al instante; la ruta la confirma al llegar.
  const [clicked, setClicked] = useState<{ href: string; from: string } | null>(null);
  const going = clicked && clicked.from === pathname && clicked.href !== matched ? clicked.href : null;
  const current = going ?? matched;

  useLayoutEffect(() => {
    const el = current ? nav.current?.querySelector<HTMLElement>(`[data-href="${current}"]`) : null;
    const p = pill.current;
    if (!p) return;
    p.style.opacity = el ? "1" : "0";
    if (!el) return;
    p.style.width = `${el.offsetWidth}px`;
    p.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [current]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <span aria-hidden className="nav-progress" data-on={Boolean(going)} />
      <div className="mx-auto flex h-[68px] w-full max-w-[1120px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={routes.portal} aria-label="Mis postulaciones" className="flex items-center gap-2.5">
          <Logo size="lg" />
          <span className="hidden rounded-md bg-amber px-1.5 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-[#1a211d] uppercase sm:inline">Postulantes</span>
        </Link>

        <nav ref={nav} aria-label="Portal" className="relative hidden items-center gap-1 rounded-full bg-surface-2/70 p-1 ring-1 ring-border md:flex">
          <span
            ref={pill}
            aria-hidden
            className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-full bg-surface opacity-0 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_8px_20px_-10px_rgba(0,0,0,0.45)] ring-1 ring-border transition-[transform,translate,width,opacity] duration-500 ease-[var(--ease-spring)]"
          />
          {LINKS.map((l, i) => {
            const on = l.href === current;
            return (
              <Link
                key={l.href}
                href={l.href}
                data-href={l.href}
                onClick={() => setClicked({ href: l.href, from: pathname })}
                aria-current={on ? "page" : undefined}
                className={cn("group relative z-10 flex h-10 items-center gap-2 rounded-full px-4 text-[14px] transition-[color,scale] duration-300 active:scale-[0.96]", on ? "font-medium text-ink" : "text-ink-2 hover:text-ink")}
              >
                <l.icon aria-hidden className={cn("size-4 transition-[color,transform,translate,scale,rotate] duration-500 ease-[var(--ease-spring)] group-hover:-rotate-6", on ? "text-amber" : "text-ink-3", l.href === going && "scale-110 animate-pulse")} />
                {l.label}
                {i === 0 ? (
                  <span className={cn("relative flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11.5px] font-semibold tabular-nums", pending ? "bg-amber text-[#1a211d]" : "bg-surface-3 text-ink-2")}>
                    {pending ? <span aria-hidden className="absolute inset-0 rounded-full bg-amber/60 animate-ping [animation-duration:2.4s]" /> : null}
                    <span className="relative">{active}</span>
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Popover
            label={`Cuenta de ${name}`}
            width={250}
            triggerClassName="flex items-center gap-2.5 rounded-full py-1 pr-1 pl-3 text-[13.5px] text-ink-2 transition-colors hover:bg-hover hover:text-ink"
            trigger={
              <>
                <span className="hidden lg:inline">{name.split(" ")[0]}</span>
                <Avatar name={name} size={34} className="bg-amber text-[#1a211d]" />
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
      </div>

      <nav aria-label="Portal" className="flex gap-2 overflow-x-auto border-t border-border px-4 py-2 md:hidden">
        {LINKS.map((l, i) => {
          const on = l.href === current;
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setClicked({ href: l.href, from: pathname })}
              aria-current={on ? "page" : undefined}
              className={cn("flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13.5px] transition-[background-color,color,box-shadow,scale] duration-300 active:scale-95", on ? "bg-surface font-medium text-ink ring-1 ring-border" : "text-ink-2")}
            >
              <l.icon aria-hidden className={cn("size-3.5", on ? "text-amber" : "text-ink-3")} />
              {l.label}
              {i === 0 ? <span className={cn("rounded-full px-1.5 text-[11px] font-semibold", pending ? "bg-amber text-[#1a211d]" : "bg-surface-3")}>{active}</span> : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
