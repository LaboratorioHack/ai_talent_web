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
  /** false en pantallas de alto fijo (tablero, chat): el encabezado no se pega ni se encoge. */
  sticky?: boolean;
  className?: string;
}

/** Envoltura que colapsa su contenido de alto a cero con transición (grid 1fr → 0fr). */
function Collapsible({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-soft)] group-data-[stuck=true]/top:grid-rows-[0fr] group-data-[stuck=true]/top:opacity-0">
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

/**
 * Encabezado de página fijo bajo la barra superior. Al bajar se encoge: el
 * título se reduce, la ruta y la descripción se pliegan y queda solo lo útil.
 * Al volver arriba recupera su tamaño, siempre con transición suave.
 */
export function PageTop({ eyebrow, title, description, actions, children, sticky = true, className }: PageTopProps) {
  const { sentinel, stuck: scrolled } = useStuck();
  const stuck = sticky && scrolled;
  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <div
        data-stuck={stuck}
        className={cn(
          "group/top z-30 border-b border-border bg-surface transition-shadow duration-500",
          "data-[stuck=true]:shadow-[0_14px_30px_-26px_rgba(21,32,27,0.5)]",
          sticky && "sticky top-[var(--app-header,0px)]",
          className,
        )}
      >
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-12 pt-6 pb-5 transition-[padding] duration-500 ease-[var(--ease-out-soft)] group-data-[stuck=true]/top:items-center group-data-[stuck=true]/top:pt-3 group-data-[stuck=true]/top:pb-3">
          <div className="flex min-w-0 flex-col">
            {eyebrow ? (
              <Collapsible>
                <div className="pb-1 text-[13px] text-ink-3">{eyebrow}</div>
              </Collapsible>
            ) : null}
            <h1 className="truncate font-head text-[30px] leading-tight font-semibold tracking-[-0.015em] transition-[font-size] duration-500 ease-[var(--ease-out-soft)] group-data-[stuck=true]/top:text-[20px]">{title}</h1>
            {description ? (
              <Collapsible>
                <p className="pt-1 text-[14px] text-ink-2">{description}</p>
              </Collapsible>
            ) : null}
          </div>
          {actions ? <div className="flex shrink-0 items-center gap-2 transition-transform duration-500 group-data-[stuck=true]/top:scale-[0.94] group-data-[stuck=true]/top:origin-right">{actions}</div> : null}
        </div>
        {children ? <div className="px-12">{children}</div> : null}
      </div>
    </>
  );
}
