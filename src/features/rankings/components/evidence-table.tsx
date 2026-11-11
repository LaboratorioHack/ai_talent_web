"use client";

import { Check, FileText, Flag, Minus, MoreHorizontal, Scale, X } from "lucide-react";
import { Popover } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { RequirementResult } from "@/shared/types/domain";
import type { RankRequirement } from "../types/ranking";

const TYPE: Record<RankRequirement["type"], string> = { MANDATORY: "Obligatorio", NICE_TO_HAVE: "Deseable", DISQUALIFYING: "Descalificante" };

const RESULT = {
  MEETS: { icon: Check, tone: "bg-success-soft text-success", points: "text-success" },
  PARTIAL: { icon: Minus, tone: "bg-warning-soft text-warning", points: "text-warning" },
  DOES_NOT_MEET: { icon: X, tone: "bg-danger-soft text-danger", points: "text-ink-3" },
  NO_EVIDENCE: { icon: Minus, tone: "bg-surface-2 text-ink-3", points: "text-ink-3" },
} as const;

export interface EvidenceTableProps {
  requirements: RankRequirement[];
  results: RequirementResult[];
  onOpenResume: () => void;
  onAiError: (requirementId: string) => void;
  onEquivalences: (requirementId: string) => void;
}

/** Cada requisito con la cita textual de la hoja de vida que lo respalda y cuánto aporta. */
export function EvidenceTable({ requirements, results, onOpenResume, onAiError, onEquivalences }: EvidenceTableProps) {
  return (
    <div className="flex flex-col">
      <div className="hidden grid-cols-[28px_minmax(0,1.1fr)_minmax(0,1.5fr)_150px_52px_36px] gap-4 border-b border-border pb-2.5 text-[12px] text-ink-3 md:grid">
        <span />
        <span>Requisito</span>
        <span>Evidencia en la hoja de vida</span>
        <span>Dónde</span>
        <span className="text-right">Aporte</span>
        <span />
      </div>
      {requirements.map((req, i) => {
        const res = results.find((r) => r.requirementId === req.id);
        if (!res) return null;
        const disq = req.type === "DISQUALIFYING";
        const r = RESULT[res.result];
        const ev = res.evidence[0];
        return (
          <div
            key={req.id}
            className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 md:grid-cols-[28px_minmax(0,1.1fr)_minmax(0,1.5fr)_150px_52px_36px] md:items-center md:gap-4 max-md:[&>*:nth-child(3)]:col-span-2 max-md:[&>*:nth-child(3)]:col-start-2 max-md:[&>*:nth-child(4)]:col-span-2 max-md:[&>*:nth-child(4)]:col-start-2 max-md:[&>*:nth-child(5)]:col-start-3 max-md:[&>*:nth-child(5)]:row-start-1 max-md:[&>*:nth-child(6)]:hidden border-b border-border py-3.5 transition-colors duration-300 last:border-0 hover:bg-surface-2/50 animate-[option-in_380ms_var(--ease-out-soft)_both]"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <span className={cn("flex size-7 items-center justify-center rounded-full", disq ? "bg-surface-2 text-ink-3" : r.tone)}>
              <r.icon aria-hidden className="size-3.5" />
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[14px] font-medium">{req.description}</span>
              <span className="text-[12px] text-ink-3">
                {TYPE[req.type]}
                {req.weight ? `, peso ${req.weight}` : ""}
              </span>
            </span>
            <span className={cn("text-[13.5px] leading-snug", ev ? "text-ink" : "text-ink-3")}>{ev ? <q className="[quotes:'“'_'”']">{ev.citation}</q> : disq ? "Sin indicios. No descalifica." : res.justification}</span>
            {ev ? (
              <button type="button" onClick={onOpenResume} className="flex items-center gap-1.5 text-left text-[12.5px] text-blue transition-colors hover:text-ink">
                <FileText aria-hidden className="size-3.5 shrink-0" />
                {ev.location}
              </button>
            ) : (
              <span className="text-[12.5px] text-ink-3">Sin cita</span>
            )}
            <span className={cn("text-right font-mono text-[14px] font-semibold tabular-nums", r.points)}>{disq ? "" : res.score ? `+${res.score}` : "0"}</span>
            <Popover
              label={`Acciones de ${req.description}`}
              width={240}
              triggerClassName="flex size-8 items-center justify-center rounded-lg text-ink-3 opacity-0 transition-[opacity,background-color] group-hover:opacity-100 hover:bg-surface-2 hover:text-ink focus-visible:opacity-100 aria-expanded:opacity-100"
              trigger={<MoreHorizontal aria-hidden className="size-4" />}
            >
              {(close) => (
                <div className="flex flex-col p-1.5">
                  <button type="button" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] text-ink-2 hover:bg-surface-2 hover:text-ink" onClick={() => { close(); onAiError(req.id); }}>
                    <Flag aria-hidden className="size-4" />
                    Marcar error de la IA
                  </button>
                  {req.equivalences.length ? (
                    <button type="button" className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13.5px] text-ink-2 hover:bg-surface-2 hover:text-ink" onClick={() => { close(); onEquivalences(req.id); }}>
                      <Scale aria-hidden className="size-4" />
                      Ver equivalencias
                    </button>
                  ) : null}
                </div>
              )}
            </Popover>
          </div>
        );
      })}
    </div>
  );
}
