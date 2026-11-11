"use client";

import { useState } from "react";
import { GripVertical, Minus, Plus, Trash2 } from "lucide-react";
import { Select } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { REQUIREMENT_TYPE_LABEL, type RequirementDraft } from "../schemas/role-profile";

export interface RequirementRowProps {
  requirement: RequirementDraft;
  onChange: (next: RequirementDraft) => void;
  onRemove: () => void;
  index: number;
}

const TYPE_OPTIONS = [
  { value: "MANDATORY", label: REQUIREMENT_TYPE_LABEL.MANDATORY, hint: "Sin él no cumple" },
  { value: "NICE_TO_HAVE", label: REQUIREMENT_TYPE_LABEL.NICE_TO_HAVE, hint: "Suma puntos" },
  { value: "DISQUALIFYING", label: REQUIREMENT_TYPE_LABEL.DISQUALIFYING, hint: "Descarta al candidato" },
];

const typeTone: Record<RequirementDraft["type"], string> = {
  MANDATORY: "border border-ink/15 bg-ink/[0.05] text-ink hover:bg-ink/[0.08]",
  NICE_TO_HAVE: "border border-border bg-surface text-ink-2 hover:border-border-strong",
  DISQUALIFYING: "border border-danger/20 bg-danger-soft/70 text-danger hover:bg-danger-soft",
};

/** Fila de la tabla de requisitos: nombre, tipo, peso, equivalencias. */
export function RequirementRow({ requirement, onChange, onRemove, index }: RequirementRowProps) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const disqualifying = requirement.type === "DISQUALIFYING";

  const setWeight = (w: number) => onChange({ ...requirement, weight: Math.min(100, Math.max(0, w)) });

  function commitEquivalence() {
    const text = draft.trim();
    if (text) {
      const match = /^(.*?)\s*(\d{1,3})\s*%?$/.exec(text);
      const label = match ? match[1].trim() : text;
      const percent = match ? Math.min(100, Number(match[2])) : 100;
      onChange({ ...requirement, equivalences: [...requirement.equivalences, { label: label || text, percent }] });
    }
    setDraft("");
    setAdding(false);
  }

  return (
    <div
      className="group flex items-center gap-4 border-b border-border px-7 py-3 transition-colors duration-300 animate-rise last:border-b-0 hover:bg-bg/60"
      style={{ "--i": index } as React.CSSProperties}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <GripVertical aria-hidden className="size-3.5 shrink-0 cursor-grab text-ink-3" />
        <input
          value={requirement.description}
          onChange={(e) => onChange({ ...requirement, description: e.target.value })}
          aria-label="Requisito"
          placeholder="Escribe el requisito"
          className="min-w-0 flex-1 bg-transparent text-base font-medium outline-none placeholder:font-normal placeholder:text-ink-3"
        />
      </div>

      <Select
        aria-label="Tipo de requisito"
        className="w-[150px] shrink-0"
        menuMinWidth={190}
        value={requirement.type}
        options={TYPE_OPTIONS}
        onChange={(v) => {
          const type = v as RequirementDraft["type"];
          onChange({ ...requirement, type, weight: type === "DISQUALIFYING" ? null : (requirement.weight ?? 10) });
        }}
        triggerClassName={cn("h-9 w-full rounded-lg px-3 text-[12.5px] font-medium", typeTone[requirement.type])}
      />

      <div className={cn("field-box flex h-9 w-24 shrink-0 items-center overflow-hidden transition-opacity duration-300", disqualifying && "pointer-events-none opacity-35")}>
        <button type="button" aria-label="Restar peso" onClick={() => setWeight((requirement.weight ?? 0) - 5)} className="flex h-full w-7 items-center justify-center text-ink-2 hover:bg-surface-2">
          <Minus aria-hidden className="size-3" />
        </button>
        <span className="flex-1 text-center font-mono text-sm">{disqualifying ? "—" : requirement.weight}</span>
        <button type="button" aria-label="Sumar peso" onClick={() => setWeight((requirement.weight ?? 0) + 5)} className="flex h-full w-7 items-center justify-center text-ink-2 hover:bg-surface-2">
          <Plus aria-hidden className="size-3" />
        </button>
      </div>

      <div className="flex w-[230px] shrink-0 flex-wrap items-center gap-1.5">
        {requirement.equivalences.map((eq, i) => (
          <button
            key={`${eq.label}-${i}`}
            type="button"
            title="Quitar equivalencia"
            onClick={() => onChange({ ...requirement, equivalences: requirement.equivalences.filter((_, j) => j !== i) })}
            className="rounded-full bg-blue-soft px-2 py-[3px] font-mono text-[10.5px] text-blue transition-colors hover:bg-danger-soft hover:text-danger"
          >
            {eq.label}
            {eq.percent < 100 ? ` ≈ ${eq.percent} %` : ""}
          </button>
        ))}
        {adding ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEquivalence}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEquivalence();
              if (e.key === "Escape") {
                setDraft("");
                setAdding(false);
              }
            }}
            placeholder="GCP 80"
            aria-label="Nueva equivalencia (nombre y porcentaje)"
            className="h-[22px] w-24 rounded-full border border-border bg-surface px-2 font-mono text-[10.5px] outline-none focus:border-ink"
          />
        ) : (
          <button
            type="button"
            aria-label="Añadir equivalencia"
            disabled={disqualifying}
            onClick={() => setAdding(true)}
            className="flex size-[22px] items-center justify-center rounded-full border border-border text-ink-3 transition-colors hover:border-ink hover:text-ink disabled:opacity-35"
          >
            <Plus aria-hidden className="size-[11px]" />
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label="Quitar requisito"
        onClick={onRemove}
        className="w-7 shrink-0 text-ink-3 opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 group-hover:opacity-100 hover:text-danger"
      >
        <Trash2 aria-hidden className="size-4" />
      </button>
    </div>
  );
}
