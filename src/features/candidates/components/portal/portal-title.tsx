"use client";

import type { ReactNode } from "react";
import { useStuck } from "@/shared/hooks/use-stuck";

/**
 * Título grande del portal que se queda bajo la barra al bajar y se encoge a
 * una línea compacta, con transición suave. Al volver arriba recupera su tamaño.
 */
export function PortalTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  const { sentinel, stuck, pinned } = useStuck();
  return (
    <>
      <div ref={sentinel} aria-hidden className="h-0" />
      <div
        data-stuck={stuck}
        data-pinned={pinned}
        className="group/title sticky top-[var(--app-header)] z-20 border-b border-transparent transition-[background-color,border-color,backdrop-filter] duration-500 data-[pinned=true]:border-border data-[pinned=true]:bg-bg/85 data-[pinned=true]:backdrop-blur-xl"
      >
        <div className="mx-auto flex w-full max-w-[1120px] items-end justify-between gap-4 px-4 pt-10 pb-2 transition-[padding] duration-500 ease-[var(--ease-out-soft)] group-data-[stuck=true]/title:items-center group-data-[stuck=true]/title:pt-3 group-data-[stuck=true]/title:pb-3 sm:px-6 lg:px-8 lg:pt-14">
          <h1 className="font-head text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] transition-[font-size] duration-500 ease-[var(--ease-out-soft)] animate-rise group-data-[stuck=true]/title:text-[22px] sm:text-[52px]">
            {children}
          </h1>
          {aside ? <div className="shrink-0 opacity-0 transition-opacity duration-500 group-data-[stuck=true]/title:opacity-100">{aside}</div> : null}
        </div>
      </div>
    </>
  );
}
