"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { Logo, Popover } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { CurrentUser } from "@/shared/types/domain";
import { CommandPalette, type SearchItem } from "./command-palette";
import { OrgSwitcher } from "./org-switcher";

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

const LINKS: { href: string; label: string }[] = [
  { href: routes.home, label: "Inicio" },
  { href: routes.vacancies, label: "Vacantes" },
  { href: routes.candidates, label: "Candidatos" },
  { href: routes.rankings, label: "Ranking" },
  { href: routes.interviews, label: "Entrevistas" },
  { href: routes.integrations, label: "Integraciones" },
  { href: routes.governance, label: "Gobierno" },
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [seen, setSeen] = useState(false);

  const activeHref = LINKS.find((l) => pathname === l.href || pathname.startsWith(`${l.href}/`))?.href;

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="flex h-[68px] items-center justify-between gap-6 px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href={routes.home} aria-label="Inicio" className="shrink-0 rounded-lg transition-opacity hover:opacity-80">
            <Logo size="lg" />
          </Link>
          <span aria-hidden className="h-6 w-px bg-border-strong" />
          <OrgSwitcher user={user} />
        </div>

        <nav aria-label="Principal" ref={nav} className="relative flex items-center gap-0.5 rounded-full bg-surface-2 p-1 ring-1 ring-border">
          <span
            ref={pill}
            aria-hidden
            className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-full bg-surface opacity-0 shadow-[0_1px_2px_rgba(21,32,27,0.08),0_4px_12px_-6px_rgba(21,32,27,0.25)] ring-1 ring-border/60 transition-[transform,width,opacity] duration-500 ease-[var(--ease-spring)]"
          />
          {LINKS.map((link) => {
            const active = link.href === activeHref;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative z-10 flex h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] whitespace-nowrap transition-colors duration-300",
                  active ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="group flex h-11 w-[250px] items-center gap-2.5 rounded-full border border-border bg-surface pr-2 pl-4 text-[14px] text-ink-3 shadow-[0_1px_2px_rgba(21,32,27,0.04)] transition-[border-color,color,box-shadow] duration-300 hover:border-border-strong hover:text-ink-2 hover:shadow-[0_6px_16px_-10px_rgba(21,32,27,0.3)] 2xl:w-[300px]"
          >
            <Search aria-hidden className="size-[18px]" />
            <span className="flex-1 truncate text-left">Buscar</span>
            <kbd className="rounded-full bg-surface-2 px-2.5 py-1 font-sans text-[11.5px] text-ink-3 ring-1 ring-border">Ctrl K</kbd>
          </button>

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
        </div>
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} items={[...PAGES, ...searchItems]} />
    </header>
  );
}
