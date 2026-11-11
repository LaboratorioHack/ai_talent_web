import { Fragment } from "react";
import { cn } from "@/shared/lib/cn";

export interface StepsProps {
  steps: string[];
  /** Índice (base 0) del paso actual. */
  current: number;
  className?: string;
}

/** Pasos para procesos largos (onboarding). El actual lleva el círculo ámbar. */
export function Steps({ steps, current, className }: StepsProps) {
  return (
    <ol className={cn("flex items-center gap-2.5", className)} aria-label="Progreso">
      {steps.map((name, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo";
        return (
          <Fragment key={name}>
            {i > 0 ? <li aria-hidden className="h-px w-9 bg-border" /> : null}
            <li className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full font-mono text-[11px] font-semibold",
                  state === "current" && "bg-amber text-ink",
                  state === "done" && "bg-ink text-ink-inverse",
                  state === "todo" && "border border-border text-ink-3",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("text-sm", state === "current" ? "font-semibold text-ink" : "text-ink-2")}>{name}</span>
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
