import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface StepFrameProps {
  step: number;
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  /** Ancho de la columna: pregunta, campos y pie quedan alineados. */
  width?: number;
  /** Sin tarjeta alrededor (cuando el contenido ya son tarjetas). */
  bare?: boolean;
  className?: string;
}

/** Pregunta grande arriba, campos en el centro, pie con Atrás / Continuar. */
export function StepFrame({ step, title, description, children, footer, width = 600, bare = false, className }: StepFrameProps) {
  return (
    <div className={cn("stagger flex flex-1 flex-col items-center gap-8 px-4 pt-8 pb-10 sm:gap-10 sm:px-6 sm:pt-16 sm:pb-16 [&>*]:animate-rise", className)}>
      <div className="flex max-w-full flex-col gap-3" style={{ width, "--i": 0 } as React.CSSProperties}>
        <p className="eyebrow">Paso {step} de 4</p>
        <h1 className="font-head text-[26px] leading-[1.1] font-semibold tracking-[-0.01em] sm:text-[34px]">{title}</h1>
        <p className="text-[15px] text-ink-2">{description}</p>
      </div>
      {/* Por encima del pie: los menús desplegables no deben quedar tapados por los botones. */}
      <div className={cn("relative z-10 flex max-w-full flex-col gap-6", !bare && "card p-5 sm:p-7")} style={{ width, "--i": 1 } as React.CSSProperties}>
        {children}
      </div>
      <div className="flex max-w-full items-center justify-between" style={{ width, "--i": 2 } as React.CSSProperties}>
        {footer}
      </div>
    </div>
  );
}
