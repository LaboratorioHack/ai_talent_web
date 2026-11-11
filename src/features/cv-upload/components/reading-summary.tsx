"use client";

import { useState } from "react";
import { AnimatedNumber } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

export type ReadingGroup = "read" | "busy" | "unreadable" | "duplicate" | "rejected";

const GROUPS: { key: ReadingGroup; label: string; color: string; hint: string }[] = [
  { key: "read", label: "Leídas", color: "var(--success)", hint: "Listas para evaluar" },
  { key: "busy", label: "Leyendo", color: "var(--blue)", hint: "Tardan unos segundos" },
  { key: "unreadable", label: "Ilegibles", color: "var(--danger)", hint: "Pide el original o reintenta" },
  { key: "rejected", label: "Rechazadas", color: "var(--amber)", hint: "No son hojas de vida o el formato no sirve" },
  { key: "duplicate", label: "Duplicadas", color: "var(--border-strong)", hint: "Se cuentan una sola vez" },
];

export interface ReadingSummaryProps {
  counts: Record<ReadingGroup, number>;
  active: ReadingGroup | null;
  onPick: (group: ReadingGroup | null) => void;
}

/**
 * Cómo va la lectura: una frase con lo importante, una barra con cada estado
 * en su proporción y debajo los estados como filtros. Pasar el ratón por un
 * tramo o un filtro resalta el otro.
 */
export function ReadingSummary({ counts, active, onPick }: ReadingSummaryProps) {
  const [hover, setHover] = useState<ReadingGroup | null>(null);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const pending = counts.unreadable + counts.rejected + counts.duplicate;
  const focus = hover ?? active;
  const pct = total ? Math.round((counts.read / total) * 100) : 0;

  return (
    <section className="card flex flex-col gap-5 px-7 py-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <p className="font-head text-[22px] leading-snug font-semibold tracking-[-0.01em]">
          <AnimatedNumber value={counts.read} className="tabular-nums" /> de <AnimatedNumber value={total} className="tabular-nums" /> listas para evaluar
          <span className="ml-2 align-middle text-[14px] font-normal text-ink-3">{pct} %</span>
        </p>
        <p className="text-[13.5px] text-ink-2">
          {counts.busy ? `${counts.busy} leyéndose ahora. ` : ""}
          {pending ? `${pending} necesitan que las mires.` : "Nada pendiente."}
        </p>
      </div>

      <div className="flex h-3 gap-[2px]" role="img" aria-label={GROUPS.map((g) => `${g.label}: ${counts[g.key]}`).join(", ")}>
        {GROUPS.map((g) =>
          counts[g.key] ? (
            <span
              key={g.key}
              onPointerEnter={() => setHover(g.key)}
              onPointerLeave={() => setHover(null)}
              onClick={() => onPick(active === g.key ? null : g.key)}
              className={cn("cursor-pointer rounded-full transition-[width,opacity,transform] duration-700 ease-[var(--ease-out-soft)]", focus && focus !== g.key && "opacity-30", g.key === "busy" && "animate-breathe")}
              style={{ width: `${(counts[g.key] / total) * 100}%`, minWidth: 8, background: g.color }}
            />
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {GROUPS.map((g) => {
          const on = active === g.key;
          const empty = counts[g.key] === 0;
          return (
            <button
              key={g.key}
              type="button"
              aria-pressed={on}
              disabled={empty && !on}
              onPointerEnter={() => setHover(g.key)}
              onPointerLeave={() => setHover(null)}
              onClick={() => onPick(on ? null : g.key)}
              title={g.hint}
              className={cn(
                "flex h-9 items-center gap-2 rounded-full pr-3.5 pl-3 text-[13px] ring-1 transition-[background-color,color,box-shadow,opacity] duration-300 disabled:opacity-40",
                on ? "bg-ink text-ink-inverse ring-ink" : "bg-surface text-ink-2 ring-border hover:text-ink hover:ring-border-strong",
              )}
            >
              <span className="size-2.5 rounded-full" style={{ background: g.color }} />
              {g.label}
              <span className={cn("font-mono text-[12px]", on ? "text-ink-inverse/80" : "text-ink")}>{counts[g.key]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
