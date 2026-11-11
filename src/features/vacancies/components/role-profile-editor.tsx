"use client";

import { useId, useState, type ReactNode } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button, DateField, NumberField, SelectField, TextField } from "@/shared/components/ui";
import { useToday } from "@/shared/hooks/use-today";
import { fromISODate, toISODate } from "@/shared/lib/dates";
import { mockAreas } from "@/shared/mocks";
import { roleProfileDraftSchema, type RequirementDraft, type RoleProfileDraft } from "../schemas/role-profile";
import { RequirementRow } from "./requirement-row";
import { ScoringSidebar } from "./scoring-sidebar";

export interface RoleProfileEditorProps {
  initial: RoleProfileDraft;
  /** Rótulo sobre el título: "VACANTES / NUEVA" o "PASO 4 DE 4 · …". */
  eyebrow: ReactNode;
  onSave: (draft: RoleProfileDraft) => Promise<void> | void;
  onEvaluate?: (draft: RoleProfileDraft) => Promise<void> | void;
  saveLabel?: string;
  evaluateLabel?: string;
}

let seq = 0;
const newId = () => `req-${Date.now()}-${seq++}`;

export function emptyRequirement(type: RequirementDraft["type"] = "MANDATORY"): RequirementDraft {
  return { id: newId(), description: "", type, weight: type === "DISQUALIFYING" ? null : 10, equivalences: [] };
}

/** Editor del perfil de cargo (pantallas 04 y 06): datos, requisitos y lateral de puntaje. */
export function RoleProfileEditor({ initial, eyebrow, onSave, onEvaluate, saveLabel = "Guardar borrador", evaluateLabel = "Evaluar" }: RoleProfileEditorProps) {
  const [draft, setDraft] = useState<RoleProfileDraft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"save" | "evaluate" | null>(null);
  const headingId = useId();
  const today = useToday();

  const patch = (p: Partial<RoleProfileDraft>) => setDraft((d) => ({ ...d, ...p }));
  const setRequirement = (i: number, next: RequirementDraft) =>
    setDraft((d) => ({ ...d, requirements: d.requirements.map((r, j) => (j === i ? next : r)) }));

  function validate(): boolean {
    const result = roleProfileDraftSchema.safeParse(draft);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) next[String(issue.path[0] ?? "form")] = issue.message;
    setErrors(next);
    return false;
  }

  async function run(kind: "save" | "evaluate") {
    if (!validate()) return;
    setBusy(kind);
    try {
      await (kind === "save" ? onSave(draft) : onEvaluate?.(draft));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-1">
      <section className="flex min-w-0 flex-1 flex-col gap-7 px-12 pt-9 pb-8" aria-labelledby={headingId}>
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <p className="eyebrow">{eyebrow}</p>
            <h1 id={headingId} className="font-head text-[34px] leading-tight font-semibold">
              {draft.title || "Nueva vacante"}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" loading={busy === "save"} disabled={busy !== null} onClick={() => run("save")}>
              {saveLabel}
            </Button>
            {onEvaluate ? (
              <Button loading={busy === "evaluate"} disabled={busy !== null} onClick={() => run("evaluate")}>
                {evaluateLabel}
              </Button>
            ) : null}
          </div>
        </header>

        <div className="grid grid-cols-[1fr_220px_220px_160px] gap-5">
          <TextField label="Nombre de la vacante" value={draft.title} maxLength={80} onChange={(e) => patch({ title: e.target.value })} error={errors.title} help="Máximo 80 caracteres" />
          <SelectField label="Área" value={draft.area} placeholder="Elige" onChange={(e) => patch({ area: e.target.value })} error={errors.area} options={mockAreas.map((a) => ({ value: a, label: a }))} />
          <DateField label="Cierre de postulaciones" value={fromISODate(draft.closesAt)} minDate={today ?? undefined} onChange={(d) => patch({ closesAt: toISODate(d) })} error={errors.closesAt} help="Solo fechas futuras" />
          <NumberField label="Número de vacantes" value={draft.openings} min={1} max={50} onChange={(n) => patch({ openings: n })} />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-4 border-b border-border pb-2.5 font-mono text-[10.5px] text-ink-3 uppercase">
            <span className="flex-1">Requisito</span>
            <span className="w-[150px]">Tipo</span>
            <span className="w-24">Peso</span>
            <span className="w-[230px]">Equivalencias</span>
            <span className="w-7" />
          </div>
          <div className="stagger flex flex-col">
            {draft.requirements.map((r, i) => (
              <RequirementRow
                key={r.id}
                index={i}
                requirement={r}
                onChange={(next) => setRequirement(i, next)}
                onRemove={() => setDraft((d) => ({ ...d, requirements: d.requirements.filter((_, j) => j !== i) }))}
              />
            ))}
          </div>
          {errors.requirements ? <p className="pt-3 text-xs text-danger">{errors.requirements}</p> : null}
          <div className="flex items-center gap-3 py-3.5">
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, requirements: [...d.requirements, emptyRequirement()] }))}
              className="inline-flex items-center gap-2 text-[13.5px] font-medium text-blue transition-colors hover:text-ink"
            >
              <Plus aria-hidden className="size-3.5" />
              Añadir requisito
            </button>
            <span className="text-sm text-ink-3">o</span>
            <button type="button" className="inline-flex items-center gap-2 text-sm text-ink-3 transition-colors hover:text-ink" title="Disponible cuando el AI Engine exponga el endpoint">
              <Sparkles aria-hidden className="size-3.5" />
              pegar la descripción del cargo y dejar que Criba los proponga
            </button>
          </div>
        </div>
      </section>

      <ScoringSidebar requirements={draft.requirements} autoInterview={draft.autoInterview} onAutoInterviewChange={(v) => patch({ autoInterview: v })} />
    </div>
  );
}
