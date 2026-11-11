"use client";

import { Loader2 } from "lucide-react";
import { AnimatedNumber } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

export type ReadingGroup = "read" | "busy" | "unreadable" | "duplicate" | "rejected";

const KEPT: { key: Exclude<ReadingGroup, "read" | "busy">; label: string; hint: string; dot: string }[] = [
  { key: "unreadable", label: "Ilegibles", hint: "pide el original", dot: "bg-danger" },
  { key: "rejected", label: "Rechazadas", hint: "no son hojas de vida", dot: "bg-amber" },
  { key: "duplicate", label: "Duplicadas", hint: "se cuentan una vez", dot: "bg-border-strong" },
];

const DOTS = [1, 1, 1, 1, 1, 1, 0.35, 1, 0.35];

export interface SieveSummaryProps {
  counts: Record<ReadingGroup, number>;
  active: ReadingGroup | null;
  onPick: (group: ReadingGroup | null) => void;
}

/** Hojas apiladas que representan lo que llegó. */
function Pile({ tone }: { tone: "ink" | "success" }) {
  return (
    <span aria-hidden className="relative h-12 w-10 shrink-0">
      {[-8, 4, 0].map((r, i) => (
        <span
          key={i}
          className={cn("absolute inset-0 rounded-[4px] border bg-surface shadow-[0_6px_14px_-8px_rgba(21,32,27,0.35)]", tone === "success" && i === 2 ? "border-success/40" : "border-border")}
          style={{ transform: `rotate(${r}deg) translate(${i * 1.5}px, ${-i * 1.5}px)` }}
        >
          {i === 2 ? (
            <>
              <span className={cn("mx-1.5 mt-2 block h-[3px] w-5 rounded-full", tone === "success" ? "bg-success/70" : "bg-ink/60")} />
              <span className="mx-1.5 mt-1.5 block h-[2px] rounded-full bg-ink/15" />
              <span className="mx-1.5 mt-1 block h-[2px] w-4 rounded-full bg-ink/15" />
            </>
          ) : null}
        </span>
      ))}
    </span>
  );
}

/**
 * La ingesta como una criba: a la izquierda lo que llegó, en el centro la
 * marca (se agita mientras lee), a la derecha lo que pasa. Lo que se queda
 * en la criba cuelga debajo y cada grupo filtra la lista.
 */
export function SieveSummary({ counts, active, onPick }: SieveSummaryProps) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const kept = counts.unreadable + counts.rejected + counts.duplicate;
  const reading = counts.busy > 0;

  return (
    <section className="card relative overflow-hidden px-8 pt-7 pb-6">
      <div className="flex items-center gap-6">
        <button type="button" onClick={() => onPick(null)} className="flex shrink-0 items-center gap-4 rounded-xl text-left">
          <Pile tone="ink" />
          <span className="flex flex-col">
            <AnimatedNumber value={total} className="font-head text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums" />
            <span className="text-[13px] text-ink-2">llegaron a esta vacante</span>
          </span>
        </button>

        <div className="relative flex flex-1 items-center gap-4">
          <svg aria-hidden viewBox="0 0 400 8" preserveAspectRatio="none" className="h-2 min-w-0 flex-1">
            <line x1="0" y1="4" x2="400" y2="4" stroke="var(--border-strong)" strokeWidth="2" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" className={cn(reading && "flow-line")} />
          </svg>
          <span className={cn("grid size-[68px] shrink-0 grid-cols-3 gap-[6px] rounded-[18px] bg-ink p-[15px] shadow-[0_16px_32px_-16px_rgba(21,32,27,0.55)]", !reading && "animate-[breathe_4s_ease-in-out_infinite]")}>
            {DOTS.map((o, d) => (
              <span
                key={d}
                className="size-full rounded-full bg-amber"
                style={{ opacity: o, animation: reading ? `sieve-wave 900ms var(--ease-spring) ${(Math.floor(d / 3) + (d % 3)) * 90}ms infinite` : undefined }}
              />
            ))}
          </span>
          <svg aria-hidden viewBox="0 0 400 8" preserveAspectRatio="none" className="h-2 min-w-0 flex-1">
            <line x1="0" y1="4" x2="400" y2="4" stroke="var(--success)" strokeWidth="2" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" className={cn(reading && "flow-line")} />
          </svg>
        </div>

        <button type="button" aria-pressed={active === "read"} onClick={() => onPick(active === "read" ? null : "read")} className="flex shrink-0 items-center gap-4 rounded-xl text-right">
          <span className="flex flex-col items-end">
            <AnimatedNumber value={counts.read} className="font-head text-[34px] leading-none font-semibold tracking-[-0.02em] text-success tabular-nums" />
            <span className="text-[13px] text-ink-2">pasan y están listas</span>
          </span>
          <Pile tone="success" />
        </button>
      </div>

      <div className="flex flex-col items-center">
        <span aria-hidden className="h-5 w-px border-l border-dashed border-border-strong" />
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-[12.5px] text-ink-3">{kept ? `${kept} se quedan en la criba` : "Nada se quedó en la criba"}</span>
          {counts.busy ? (
            <button type="button" aria-pressed={active === "busy"} onClick={() => onPick(active === "busy" ? null : "busy")} className={cn("flex h-8 items-center gap-1.5 rounded-full px-3 text-[12.5px] ring-1 transition-colors", active === "busy" ? "bg-ink text-ink-inverse ring-ink" : "bg-blue-soft text-blue ring-transparent")}>
              <Loader2 aria-hidden className="size-3.5 animate-spin" />
              Leyendo {counts.busy}
            </button>
          ) : null}
          {KEPT.map((k) => {
            const on = active === k.key;
            const n = counts[k.key];
            return (
              <button
                key={k.key}
                type="button"
                aria-pressed={on}
                disabled={!n && !on}
                onClick={() => onPick(on ? null : k.key)}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-full pr-3 pl-2.5 text-[12.5px] ring-1 transition-[background-color,color,box-shadow,opacity] duration-300 disabled:opacity-40",
                  on ? "bg-ink text-ink-inverse ring-ink" : "bg-surface text-ink-2 ring-border hover:text-ink hover:ring-border-strong",
                )}
              >
                <span className={cn("size-2 rounded-full", k.dot)} />
                <span className="font-medium">
                  {n} {k.label.toLowerCase()}
                </span>
                <span className={cn(on ? "text-ink-inverse/70" : "text-ink-3")}>{k.hint}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
