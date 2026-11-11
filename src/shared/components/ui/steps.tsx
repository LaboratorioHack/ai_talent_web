import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface StepsProps {
  steps: string[];
  /** Índice (base 0) del paso actual. Igual a steps.length cuando todo está hecho. */
  current: number;
  /** Si se pasa, los pasos ya hechos son botones para volver a ellos. */
  onStepClick?: (index: number) => void;
  className?: string;
}

/**
 * Pasos para procesos largos (onboarding). Los hechos muestran un check y se
 * puede volver a ellos; el actual lleva el círculo ámbar; la línea entre pasos
 * se llena al avanzar.
 */
export function Steps({ steps, current, onStepClick, className }: StepsProps) {
  return (
    <ol className={cn("flex items-center gap-2.5", className)} aria-label="Progreso">
      {steps.map((name, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        const clickable = state === "done" && onStepClick;
        const content = (
          <>
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full font-mono text-[11px] font-semibold transition-[background-color,color,box-shadow,transform] duration-500 ease-[var(--ease-spring)]",
                state === "current" && "scale-105 bg-amber text-ink shadow-[0_0_0_4px_rgba(242,169,59,0.22)]",
                state === "done" && "bg-ink text-ink-inverse",
                state === "todo" && "border border-border-strong text-ink-3",
              )}
            >
              {state === "done" ? <Check aria-hidden className="size-3.5 animate-[pop-in_400ms_var(--ease-spring)_both]" /> : i + 1}
            </span>
            <span className={cn("text-sm transition-colors duration-300", state === "current" ? "font-semibold text-ink" : state === "done" ? "text-ink" : "text-ink-3")}>{name}</span>
          </>
        );
        return (
          <Fragment key={name}>
            {i > 0 ? (
              <li aria-hidden className="relative h-[2px] w-10 overflow-hidden rounded-full bg-border">
                <span
                  className="absolute inset-0 origin-left rounded-full bg-ink transition-transform duration-700 ease-[var(--ease-out-soft)]"
                  style={{ transform: `scaleX(${i <= current ? 1 : 0})` }}
                />
              </li>
            ) : null}
            <li aria-current={state === "current" ? "step" : undefined}>
              {clickable ? (
                <button type="button" onClick={() => onStepClick(i)} className="flex items-center gap-2 rounded-full py-1 pr-2 transition-colors duration-300 hover:bg-surface-2" aria-label={`Volver a ${name}`}>
                  {content}
                </button>
              ) : (
                <span className="flex items-center gap-2 py-1 pr-2">{content}</span>
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

export interface ProgressSegmentsProps {
  total: number;
  current: number;
  className?: string;
}

/** Barra segmentada de progreso (login / onboarding). */
export function ProgressSegments({ total, current, className }: ProgressSegmentsProps) {
  return (
    <div className={cn("flex gap-1.5", className)} role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={current + 1}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={cn("h-1 flex-1 rounded-sm", i <= current ? "bg-amber" : "bg-border")} />
      ))}
    </div>
  );
}
