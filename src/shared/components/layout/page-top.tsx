"use client";

import type { ReactNode } from "react";
import { useStuck } from "@/shared/hooks/use-stuck";
import { cn } from "@/shared/lib/cn";

export interface PageTopProps {
  /** Ruta de migas o rótulo corto sobre el título. */
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  /** Pestañas o filtros bajo el título; quedan fijos con él. */
  children?: ReactNode;
  className?: string;
}

/**
 * Encabezado de página fijo bajo la barra superior. Mantiene siempre el mismo
 * tamaño (nada salta al hacer scroll); al pegarse solo gana una sombra suave.
 */
export function PageTop({ eyebrow, title, description, actions, children, className }: PageTopProps) {
  const { sentinel, stuck } = useStuck();
  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <div
        data-stuck={stuck}
        className={cn(
          "sticky top-[var(--app-header,0px)] z-30 border-b border-border bg-surface/90 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-500",
          "data-[stuck=true]:shadow-[0_14px_30px_-26px_rgba(21,32,27,0.5)]",
          className,
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-12 pt-6 pb-5">
          <div className="flex min-w-0 flex-col gap-1">
            {eyebrow ? <div className="text-[13px] text-ink-3">{eyebrow}</div> : null}
            <h1 className="truncate font-head text-[30px] leading-tight font-semibold tracking-[-0.015em]">{title}</h1>
            {description ? <p className="text-[14px] text-ink-2">{description}</p> : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
        </div>
        {children ? <div className="px-12">{children}</div> : null}
      </div>
    </>
  );
}
