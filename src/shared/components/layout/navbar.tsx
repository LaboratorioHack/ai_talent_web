"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Briefcase, FileText, Home, LayoutGrid, ListOrdered, MessagesSquare, ShieldCheck, type LucideIcon } from "lucide-react";
import { Logo, Popover } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { CurrentUser } from "@/shared/types/domain";
import { NavSearch, type SearchItem } from "./nav-search";
import { OrgBadge } from "./org-badge";
import { ThemeToggle } from "./theme-toggle";

export interface NavNotice {
  id: string;
  text: string;
  when: string;
  href: string;
  tone: "success" | "warning" | "danger";
}

export interface NavbarProps {
  user: CurrentUser;
  notices?: NavNotice[];
  searchItems?: SearchItem[];
  /** Menú de la cuenta (lo aporta la feature de auth, que sabe cerrar sesión). */
  accountMenu?: ReactNode;
}

const LINKS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: routes.home, label: "Inicio", icon: Home },
  { href: routes.vacancies, label: "Vacantes", icon: Briefcase },
  { href: routes.candidates, label: "Candidatos", icon: FileText },
  { href: routes.rankings, label: "Ranking", icon: ListOrdered },
  { href: routes.interviews, label: "Entrevistas", icon: MessagesSquare },
  { href: routes.governance, label: "Gobierno", icon: ShieldCheck },
];

const PAGES: SearchItem[] = LINKS.map((l) => ({ id: `page-${l.href}`, label: l.label, href: l.href, group: "Páginas" }));

const TONE_DOT = { success: "bg-success", warning: "bg-warning", danger: "bg-danger" } as const;

/**
 * Barra superior en una sola fila y fija arriba: marca y organización a la
 * izquierda, secciones al centro con una píldora que se desliza a la activa,
 * y buscador, avisos y cuenta a la derecha.
 */
export function Navbar({ user, notices = [], searchItems = [], accountMenu }: NavbarProps) {
  const pathname = usePathname();
  const nav = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);
  const [searching, setSearching] = useState(false);
  const [menu, setMenu] = useState(false);
  const [seen, setSeen] = useState(false);

  const activeLink = LINKS.find((l) => pathname === l.href || pathname.startsWith(`${l.href}/`));
  const activeHref = activeLink?.href;
  const activeLabel = activeLink?.label;
  const ActiveIcon = activeLink?.icon ?? LayoutGrid;

  // La píldora se mueve hasta el enlace activo; se escribe en el DOM para que la transición sea continua.
  useLayoutEffect(() => {
    const el = activeHref ? nav.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`) : null;
    const p = pill.current;
    if (!p) return;
    if (!el) {
      p.style.opacity = "0";
      return;
    }
    p.style.opacity = "1";
    p.style.width = `${el.offsetWidth}px`;
    p.style.transform = `translateX(${el.offsetLeft}px)`;
  }, [activeHref]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex h-16 items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:h-[68px] min-[1680px]:gap-6 min-[1680px]:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href={routes.home} aria-label="Inicio" className="shrink-0 rounded-lg transition-opacity hover:opacity-80">
            <Logo size="lg" className="max-sm:[&>span:last-child]:hidden" />
          </Link>
          <span aria-hidden className="hidden h-6 w-px bg-border-strong md:block" />
          <span className="hidden md:block">
            <OrgBadge user={user} />
          </span>
        </div>

        {/*
          Mientras se busca, la píldora de secciones se recoge en un solo botón
          redondo con el icono de la sección actual; al salir de la búsqueda se
          vuelve a abrir. Nada desaparece.
        */}
        <nav aria-label="Principal" ref={nav} className="relative hidden min-w-0 items-center rounded-full bg-surface-2 p-1 ring-1 ring-border lg:flex">
          <div
            className={cn(
              "grid transition-[grid-template-columns,opacity,filter] duration-[650ms] ease-[var(--ease-out-soft)]",
              searching ? "pointer-events-none grid-cols-[0fr] opacity-0 blur-[2px]" : "grid-cols-[1fr] opacity-100",
            )}
            aria-hidden={searching || undefined}
          >
            <div className="relative -m-1 flex min-w-0 items-center gap-0.5 overflow-hidden p-1">
              <span
                ref={pill}
                aria-hidden
                className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-full bg-surface opacity-0 shadow-[0_1px_2px_rgba(21,32,27,0.08),0_4px_12px_-6px_rgba(21,32,27,0.25)] ring-1 ring-border/60 transition-[transform,translate,scale,rotate,width,opacity] duration-500 ease-[var(--ease-spring)]"
              />
              {LINKS.map((link) => {
                const active = link.href === activeHref;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    data-href={link.href}
                    tabIndex={searching ? -1 : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative z-10 flex h-10 items-center gap-1.5 rounded-full px-3 text-[14px] whitespace-nowrap transition-colors duration-300 min-[1680px]:px-3.5",
                      active ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <span
            aria-hidden={!searching || undefined}
            className={cn(
              "grid transition-[grid-template-columns,opacity] duration-[650ms] ease-[var(--ease-out-soft)]",
              searching ? "grid-cols-[1fr] opacity-100" : "pointer-events-none grid-cols-[0fr] opacity-0",
            )}
          >
            <span className="-m-1 min-w-0 overflow-hidden p-1">
              <button
                type="button"
                tabIndex={searching ? undefined : -1}
                aria-label={`Volver a las secciones${activeLabel ? `, estás en ${activeLabel}` : ""}`}
                title={activeLabel}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full bg-surface text-ink shadow-[0_1px_2px_rgba(21,32,27,0.08),0_4px_12px_-6px_rgba(21,32,27,0.25)] ring-1 ring-border/60 transition-transform duration-500 ease-[var(--ease-spring)]",
                  searching ? "scale-100 rotate-0" : "scale-50 -rotate-90",
                )}
              >
                <ActiveIcon aria-hidden className="size-[18px]" />
              </button>
            </span>
          </span>
        </nav>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <NavSearch items={[...PAGES, ...searchItems]} onOpenChange={setSearching} />
          <ThemeToggle />

          <Popover
            label={`Avisos${notices.length && !seen ? `, ${notices.length} nuevos` : ""}`}
            width={360}
            onOpenChange={(o) => o && setSeen(true)}
            triggerClassName="relative flex size-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-300 hover:bg-surface-2 hover:text-ink"
            trigger={
              <>
                <Bell aria-hidden className="size-[18px]"/>
                {notices.length && !seen ? <span aria-hidden className="absolute top-2.5 right-2.5 size-2 rounded-full bg-amber ring-2 ring-bg animate-[pop-in_400ms_var(--ease-spring)_both]" /> : null}
              </>
            }
          >
            {(close) => (
              <div className="flex flex-col">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <p className="text-[14px] font-semibold">Avisos</p>
                  <span className="text-xs text-ink-3">{notices.length} pendientes</span>
                </div>
                <ul className="flex max-h-[360px] flex-col overflow-y-auto p-1.5">
                  {notices.map((n, i) => (
                    <li key={n.id} className="animate-[option-in_300ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 40}ms` }}>
                      <Link href={n.href} onClick={close} className="flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-2">
                        <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[n.tone])} />
                        <span className="flex flex-1 flex-col gap-0.5">
                          <span className="text-[13.5px] leading-snug">{n.text}</span>
                          <span className="text-xs text-ink-3">{n.when}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Popover>

          {accountMenu}

          {/* Celular y tablet: secciones y organización en un menú propio. */}
          <button
            type="button"
            onClick={() => setMenu((o) => !o)}
            aria-expanded={menu}
            aria-controls="mobile-menu"
            aria-label={menu ? "Cerrar menú" : "Abrir menú"}
            className="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-2 lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
              <path d="M3 6.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={cn("origin-center transition-transform duration-500 ease-[var(--ease-out-soft)] [transform-box:fill-box]", menu && "translate-y-[3.5px] rotate-45")} />
              <path d="M3 13.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className={cn("origin-center transition-transform duration-500 ease-[var(--ease-out-soft)] [transform-box:fill-box]", menu && "-translate-y-[3.5px] -rotate-45")} />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={cn(
          "grid border-t border-border/60 transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-soft)] lg:hidden",
          menu ? "grid-rows-[1fr] opacity-100" : "pointer-events-none grid-rows-[0fr] border-transparent opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <nav aria-label="Secciones" className="flex flex-col gap-1 px-3 pt-3 pb-4 sm:px-6">
            <div className="mb-2 md:hidden">
              <OrgBadge user={user} />
            </div>
            {LINKS.map((link) => {
              const active = link.href === activeHref;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={menu ? undefined : -1}
                  onClick={() => setMenu(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn("flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition-colors", active ? "bg-surface font-medium text-ink ring-1 ring-border" : "text-ink-2 hover:bg-surface-2 hover:text-ink")}
                >
                  <link.icon aria-hidden className="size-[18px]" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

    </header>
  );
}
