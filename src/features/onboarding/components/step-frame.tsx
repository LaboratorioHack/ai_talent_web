import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface StepFrameProps {
  step: number;
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  /** Ancho del bloque de campos; la pregunta siempre ocupa 720px. */
  width?: number;
  className?: string;
}

/** Pregunta grande arriba, campos en el centro, pie con Atrás / Continuar. */
export function StepFrame({ step, title, description, children, footer, width = 560, className }: StepFrameProps) {
  return (
    <div className={cn("stagger flex flex-1 flex-col items-center gap-8 pt-14 [&>*]:animate-rise", className)}>
      <div className="flex w-[720px] flex-col gap-2.5" style={{ "--i": 0 } as React.CSSProperties}>
        <p className="eyebrow">Paso {step} de 4</p>
        <h1 className="font-head text-4xl leading-tight font-semibold">{title}</h1>
        <p className="text-base text-ink-2">{description}</p>
      </div>
      <div className="flex flex-col gap-5" style={{ width, "--i": 1 } as React.CSSProperties}>
        {children}
      </div>
      <div className="flex items-center justify-between" style={{ width, "--i": 2 } as React.CSSProperties}>
        {footer}
      </div>
    </div>
  );
}
