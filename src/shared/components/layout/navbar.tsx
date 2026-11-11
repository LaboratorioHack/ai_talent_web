"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LifeBuoy } from "lucide-react";
import { Logo, SearchField } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { CurrentUser } from "@/shared/types/domain";
import { OrgSwitcher } from "./org-switcher";

export interface NavCounts {
  vacancies?: number;
  candidates?: number;
  interviews?: number;
}

export interface NavbarProps {
  user: CurrentUser;
  counts?: NavCounts;
}

interface NavLink {
  href: string;
  label: string;
  countKey?: keyof NavCounts;
}

const links: NavLink[] = [
  { href: routes.home, label: "Inicio" },
  { href: routes.vacancies, label: "Vacantes", countKey: "vacancies" },
  { href: routes.candidates, label: "Candidatos", countKey: "candidates" },
  { href: routes.rankings, label: "Ranking IA" },
  { href: routes.interviews, label: "Entrevista IA", countKey: "interviews" },
  { href: routes.integrations, label: "Integraciones" },
  { href: routes.governance, label: "Gobierno IA" },
];

/**
 * Una sola barra superior en dos filas: contexto (marca, organización, buscador,
 * avisos) y pestañas. La activa se marca con tinta y subrayado; el resto en gris.
 */
export function Navbar({ user, counts = {} }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface">
      <div className="flex h-12 items-center gap-3.5 border-b border-border px-12">
        <Link href={routes.home} aria-label="Inicio" className="shrink-0">
          <Logo />
        </Link>
        <span aria-hidden className="text-ink-3">
          /
        </span>
        <OrgSwitcher user={user} />
        <div className="flex-1" />
        <SearchField shortcut="⌘K" containerClassName="h-[34px] w-[300px]" />
        <button type="button" aria-label="Avisos" className="rounded p-1 text-ink-2 hover:bg-surface-2 hover:text-ink">
          <Bell aria-hidden className="size-[18px]" />
        </button>
        <button type="button" aria-label="Ayuda" className="rounded p-1 text-ink-2 hover:bg-surface-2 hover:text-ink">
          <LifeBuoy aria-hidden className="size-[18px]" />
        </button>
        <span className="size-7 rounded-full bg-amber" aria-label={user.name} title={user.name} />
      </div>

      <nav aria-label="Principal" className="flex h-[42px] items-stretch gap-0.5 px-[38px]">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
          const count = link.countKey ? counts[link.countKey] : undefined;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-1.5 px-2.5 text-[13.5px] whitespace-nowrap transition-colors duration-300",
                active ? "border-b-2 border-ink font-medium text-ink" : "text-ink-2 hover:text-ink",
              )}
            >
              {link.label}
              {count !== undefined ? (
                <span className="rounded-full bg-surface-2 px-1.5 py-px font-mono text-[10.5px] text-ink-2">{count}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
