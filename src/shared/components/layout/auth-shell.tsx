import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { Logo } from "@/shared/components/ui";
import { ThemeToggle } from "./theme-toggle";

export interface AuthShellProps {
  /** "Postulantes" en el portal del candidato; nada en el de empresas. */
  badge?: string;
  /** El formulario y lo que lo acompaña. */
  children: ReactNode;
  /** Panel oscuro de la derecha (solo en pantallas anchas). */
  scene: ReactNode;
  /** Nota corta al pie, p. ej. cómo se crean las cuentas. */
  note: string;
}

/**
 * Marco común de las dos entradas a Criba (empresas y postulantes): misma columna, mismo
 * encabezado y pie, y una escena oscura a la derecha. Solo cambia el formulario y la escena.
 */
export function AuthShell({ badge, children, scene, note }: AuthShellProps) {
  return (
    <main className="flex min-h-dvh lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <section className="flex w-full flex-col justify-between gap-8 px-6 py-8 sm:px-12 lg:w-[560px] lg:shrink-0 lg:overflow-y-auto lg:px-[72px] short:py-6 shorter:py-4">
        <header className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2.5">
            <Logo />
            {badge ? <span className="rounded-md bg-amber px-1.5 py-0.5 text-[10.5px] font-bold tracking-[0.08em] text-[#1a211d] uppercase">{badge}</span> : null}
          </span>
          <ThemeToggle />
        </header>
        <div className="flex flex-col">{children}</div>
        <footer className="text-xs text-ink-3">{note}</footer>
      </section>
      {scene}
    </main>
  );
}

export interface AuthHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

/** Encabezado igual en las dos entradas. */
export function AuthHeading({ eyebrow, title, description }: AuthHeadingProps) {
  return (
    <div className="flex flex-col gap-2" style={{ "--i": 0 } as React.CSSProperties}>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="font-head text-[32px] leading-tight font-semibold short:text-[28px] shorter:text-[26px]">{title}</h1>
      <p className="text-base text-ink-2">{description}</p>
    </div>
  );
}

export interface AuthSwitchProps {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

/** Tarjeta para pasar a la otra entrada (empresa ↔ postulante). */
export function AuthSwitch({ href, icon: Icon, title, description }: AuthSwitchProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-amber/10 px-4 py-3.5 ring-1 ring-amber/30 transition-[background-color,box-shadow] duration-300 hover:bg-amber/15 hover:ring-amber/50"
      style={{ "--i": 2 } as React.CSSProperties}
    >
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber text-[#1a211d]">
        <Icon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-[14.5px] font-semibold text-ink">{title}</span>
        <span className="text-[13px] text-ink-2">{description}</span>
      </span>
      <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-2 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}
