"use client";

import { StatusChip, Toggle } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { weightTotals, type RequirementDraft } from "../schemas/role-profile";

export interface ScoringSidebarProps {
  requirements: RequirementDraft[];
  autoInterview: boolean;
  onAutoInterviewChange: (v: boolean) => void;
}

const thresholds = [
  { status: "meets", rule: "Todos los obligatorios" },
  { status: "partial", rule: "Falta 1 obligatorio" },
  { status: "does_not_meet", rule: "Falta más de 1 obligatorio" },
  { status: "discarded", rule: "Cualquier descalificante" },
] as const;

/** Lateral "Cómo se puntúa": suma de pesos, barra apilada, umbrales y opciones. */
export function ScoringSidebar({ requirements, autoInterview, onAutoInterviewChange }: ScoringSidebarProps) {
  const { mandatory, niceToHave, total } = weightTotals(requirements);
  const weighted = requirements.filter((r) => r.type !== "DISQUALIFYING" && (r.weight ?? 0) > 0);
  const ok = total === 100;

  return (
    <aside className="flex w-[360px] shrink-0 flex-col gap-7 border-l border-border py-9 pr-12 pl-8">
      <h2 className="font-head text-2xl font-semibold">Cómo se puntúa</h2>

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-2">Suma de pesos</span>
          <span className={cn("font-mono text-xs font-semibold transition-colors duration-300", ok ? "text-success" : "text-warning")} aria-live="polite">
            {total} / 100
          </span>
        </div>
        <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-sm bg-surface-2">
          {weighted.map((r) => (
            <div
              key={r.id}
              title={`${r.description} · ${r.weight}`}
              className={cn("h-full rounded-sm transition-[flex-basis] duration-500 ease-[var(--ease-out-soft)]", r.type === "MANDATORY" ? "bg-ink" : "bg-ink-3")}
              style={{ flexBasis: `${r.weight}%` }}
            />
          ))}
        </div>
        <div className="flex gap-4 text-xs text-ink-2">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-ink" /> Obligatorios {mandatory}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-sm bg-ink-3" /> Deseables {niceToHave}
          </span>
        </div>
        {!ok ? <p className="text-xs text-warning">Ajusta los pesos hasta sumar 100.</p> : null}
      </div>

      <ul className="flex flex-col">
        {thresholds.map((t) => (
          <li key={t.status} className="flex flex-col items-start gap-1.5 border-b border-border py-3.5">
            <StatusChip status={t.status} size="sm" />
            <span className="text-xs text-ink-2">{t.rule}</span>
          </li>
        ))}
      </ul>

      <div className="flex-1" />

      <Toggle checked={autoInterview} onChange={onAutoInterviewChange} label="Entrevista IA automática" description="A quien cumpla el perfil se le envía el enlace" />
      <Toggle checked onChange={() => undefined} disabled label="Ignorar foto y datos personales" description="Fijo por política · no se puede cambiar" className="opacity-60" />
    </aside>
  );
}
