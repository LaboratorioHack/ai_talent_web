"use client";

import { useId, useState, type ReactNode } from "react";
import { ListPlus, Plus } from "lucide-react";
import { Button, Collapse, CribaCharacter, DateField, NumberField, SelectField, TextArea, TextField, useToast } from "@/shared/components/ui";
import { useStuck } from "@/shared/hooks/use-stuck";
import { useToday } from "@/shared/hooks/use-today";
import { cn } from "@/shared/lib/cn";
import { withCriba } from "@/shared/lib/criba-work";
import { formatShortDate, fromISODate, toISODate } from "@/shared/lib/dates";
import { AREAS, CONTRACTS, MODALITIES, SCHEDULES } from "@/shared/constants/vacancy";
import { roleProfileDraftSchema, weightTotals, type ListingDraft, type RequirementDraft, type RoleProfileDraft } from "../schemas/role-profile";
import { vacancyErrorMessage } from "../api/errors";
import { profileAssistErrorMessage, proposeRequirements, suggestEquivalences } from "../api/role-profiles";
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
const MIN_DESCRIPTION = 40;
const keyOf = (text: string) => text.trim().toLowerCase();

export function emptyRequirement(type: RequirementDraft["type"] = "MANDATORY"): RequirementDraft {
  return { id: newId(), description: "", type, weight: type === "DISQUALIFYING" ? null : 10, equivalences: [] };
}

/** Editor del perfil de cargo (pantallas 04 y 06): datos, requisitos y lateral de puntaje. */
export function RoleProfileEditor({ initial, eyebrow, onSave, onEvaluate, saveLabel = "Guardar borrador", evaluateLabel = "Evaluar" }: RoleProfileEditorProps) {
  const [draft, setDraft] = useState<RoleProfileDraft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"save" | "evaluate" | "propose" | null>(null);
  const { toast } = useToast();
  const descriptionId = useId();

  async function propose() {
    const length = draft.description.trim().length;
    if (length < MIN_DESCRIPTION) {
      toast({
        tone: "error",
        title: length ? "La descripción es muy corta" : "Falta la descripción del cargo",
        description: length
          ? `Escribe al menos ${MIN_DESCRIPTION} caracteres sobre qué hará la persona y qué necesita saber; llevas ${length}.`
          : "Escríbela o pégala arriba: Criba propone los requisitos a partir de ella.",
      });
      document.getElementById(descriptionId)?.querySelector("textarea")?.focus();
      return;
    }
    setBusy("propose");
    try {
      const written = draft.requirements.filter((r) => r.description.trim());
      const suggested = await withCriba("Lee la descripción y propone los requisitos", proposeRequirements(draft, written), "reading");
      const known = new Set(written.map((r) => keyOf(r.description)));
      const fresh = suggested.filter((r) => !known.has(keyOf(r.description)));
      // Las filas vacías del borrador inicial dejan su lugar a lo propuesto.
      if (fresh.length) setDraft((d) => ({ ...d, requirements: [...d.requirements.filter((r) => r.description.trim()), ...fresh] }));
      toast({ title: fresh.length ? `Criba propuso ${fresh.length} requisitos` : "No hay requisitos nuevos que proponer", description: fresh.length ? "Revisa su tipo, su peso y sus equivalencias antes de guardar." : undefined });
    } catch (error) {
      toast({ tone: "error", title: "Criba no pudo proponer requisitos", description: profileAssistErrorMessage(error) });
    } finally {
      setBusy(null);
    }
  }

  async function suggestFor(requirement: RequirementDraft) {
    if (requirement.description.trim().length < 2) {
      toast({ tone: "error", title: "Escribe primero el requisito", description: "Criba sugiere equivalencias a partir de su nombre." });
      return;
    }
    try {
      const found = await withCriba(`Busca equivalencias para «${requirement.description.trim()}»`, suggestEquivalences(requirement.description, draft, requirement.equivalences.map((e) => e.label)));
      const seen = new Set(requirement.equivalences.map((e) => keyOf(e.label)));
      const extra = found.filter((e) => !seen.has(keyOf(e.label)));
      if (!extra.length) {
        toast({ title: `Sin equivalencias para «${requirement.description.trim()}»`, description: "Criba no encontró alternativas que lo cubran." });
        return;
      }
      setDraft((d) => ({
        ...d,
        requirements: d.requirements.map((r) => {
          if (r.id !== requirement.id) return r;
          const current = new Set(r.equivalences.map((e) => keyOf(e.label)));
          return { ...r, equivalences: [...r.equivalences, ...extra.filter((e) => !current.has(keyOf(e.label)))] };
        }),
      }));
      toast({ title: `Criba sugirió ${extra.length} ${extra.length === 1 ? "equivalencia" : "equivalencias"}`, description: "Revisa el porcentaje; haz clic en una para quitarla." });
    } catch (error) {
      toast({ tone: "error", title: "Criba no pudo sugerir equivalencias", description: profileAssistErrorMessage(error) });
    }
  }
  const headingId = useId();
  const { sentinel, stuck } = useStuck();
  const today = useToday();

  const patch = (p: Partial<RoleProfileDraft>) => setDraft((d) => ({ ...d, ...p }));
  const patchListing = (p: Partial<ListingDraft>) => setDraft((d) => ({ ...d, listing: { ...d.listing, ...p } }));
  const setRequirement = (i: number, next: RequirementDraft) =>
    setDraft((d) => ({ ...d, requirements: d.requirements.map((r, j) => (j === i ? next : r)) }));

  function validate(): boolean {
    const result = roleProfileDraftSchema.safeParse(draft);
    if (result.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of result.error.issues) {
      // La sección (p. ej. "requirements") y el campo exacto (p. ej. "listing.salary").
      next[String(issue.path[0] ?? "form")] ??= issue.message;
      next[issue.path.join(".")] = issue.message;
    }
    setErrors(next);
    return false;
  }

  async function run(kind: "save" | "evaluate") {
    if (!validate()) return;
    // Un borrador se guarda con cualquier suma; publicar exige 100, y se avisa antes de llamar a la API.
    const { total } = weightTotals(draft.requirements);
    if (kind === "evaluate" && total !== 100) {
      setErrors((e) => ({ ...e, requirements: `Los pesos suman ${total}: ajústalos hasta 100 para publicar.` }));
      toast({ tone: "error", title: "Ajusta los pesos hasta sumar 100", description: `Ahora suman ${total}. Puedes guardarla como borrador y terminarla después.` });
      return;
    }
    setBusy(kind);
    try {
      await (kind === "save" ? onSave(draft) : onEvaluate?.(draft));
    } catch (error) {
      toast({ tone: "error", title: kind === "save" ? "No se pudo guardar" : "No se pudo publicar", description: vacancyErrorMessage(error) });
    } finally {
      setBusy(null);
    }
  }

  const mandatory = draft.requirements.filter((r) => r.type === "MANDATORY").length;
  const closesDate = fromISODate(draft.closesAt);
  const closesLabel = closesDate ? formatShortDate(closesDate) : null;

  return (
    <div className="flex flex-1 flex-col items-stretch lg:flex-row lg:items-start">
      <section className="flex min-w-0 flex-1 flex-col gap-6 px-4 pt-6 pb-10 sm:px-6 sm:pt-10 lg:px-10 lg:pb-12 xl:px-14" aria-labelledby={headingId}>
        <div ref={sentinel} aria-hidden className="-mb-6 h-px" />
        {/* Al pegarse se vuelve una barra flotante, separada de los bordes. */}
        <header data-stuck={stuck} className={cn("sticky z-20 transition-[top] duration-500 ease-[var(--ease-out-soft)]", stuck ? "top-[calc(var(--app-header,0px)+12px)]" : "top-[var(--app-header,0px)]")}>
          <div
            className={cn(
              "flex flex-wrap justify-between gap-6 rounded-2xl border",
              "transition-[background-color,border-color,box-shadow,padding,margin] duration-500 ease-[var(--ease-out-soft)]",
              stuck
                ? "-mx-3 items-center border-border bg-surface py-3 pr-3 pl-5 shadow-[0_18px_40px_-24px_rgba(21,32,27,0.45)]"
                : "mx-0 items-end border-transparent bg-transparent px-0 py-2",
            )}
          >
          <div className={cn("flex min-w-0 flex-col", stuck ? "gap-0.5" : "gap-2")}>
            <p className={cn("eyebrow overflow-hidden transition-[max-height,opacity] duration-500 ease-[var(--ease-out-soft)]", stuck ? "max-h-0 opacity-0" : "max-h-6 opacity-100")}>{eyebrow}</p>
            <h1
              id={headingId}
              className={cn("truncate font-head leading-tight font-semibold tracking-[-0.01em] transition-[font-size] duration-500 ease-[var(--ease-out-soft)]", stuck ? "text-[18px]" : "text-[26px] sm:text-[34px]")}
            >
              {draft.title || "Nueva vacante"}
            </h1>
            {/* Subtítulo compacto: solo cuando la barra está pegada. */}
            <p
              aria-hidden={!stuck}
              className={cn(
                "overflow-hidden text-[12.5px] text-ink-3 transition-[max-height,opacity] duration-500 ease-[var(--ease-out-soft)]",
                stuck ? "max-h-5 opacity-100" : "max-h-0 opacity-0",
              )}
            >
              {closesLabel ? `Cierra el ${closesLabel} y tiene ${draft.requirements.length} requisitos` : `${draft.requirements.length} requisitos`}
            </p>
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
          </div>
        </header>

        <section className="card p-7 animate-rise [animation-delay:80ms]" aria-label="Datos de la vacante">
          <h2 className="mb-6 text-[15px] font-semibold">Datos de la vacante</h2>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
            <TextField label="Nombre de la vacante" value={draft.title} maxLength={80} onChange={(e) => patch({ title: e.target.value })} error={errors.title} kind={`${draft.title.length} / 80`} />
            <SelectField label="Área" value={draft.area} placeholder="Elige un área" onChange={(area) => patch({ area })} error={errors.area} options={AREAS.map((a) => ({ value: a, label: a }))} />
            <DateField label="Cierre de postulaciones" value={fromISODate(draft.closesAt)} minDate={today ?? undefined} onChange={(d) => patch({ closesAt: toISODate(d) })} error={errors.closesAt} help="Solo fechas futuras" />
            <NumberField label="Número de vacantes" value={draft.openings} min={1} max={50} onChange={(n) => patch({ openings: n })} help="Personas a contratar" />
            <div id={descriptionId} className="md:col-span-2">
              <TextArea
                label="Descripción del cargo"
                placeholder="Qué hará la persona, con quién trabajará y qué necesita saber. Puedes pegar la oferta tal como la publicas."
                value={draft.description}
                maxLength={4000}
                error={errors.description}
                kind={`${draft.description.length} / 4000`}
                help="Criba la usa para proponer requisitos y para preparar la entrevista"
                onChange={(e) => patch({ description: e.target.value })}
              />
            </div>
          </div>
        </section>

        <section className="card p-7 animate-rise [animation-delay:130ms]" aria-label="Publicación">
          <header className="mb-6 flex flex-col gap-1">
            <h2 className="text-[15px] font-semibold">Publicación</h2>
            <p className="text-[13px] text-ink-3">Lo que ve el candidato en la vacante pública. Lo que dejes vacío no se muestra.</p>
          </header>
          <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
            <TextField label="Ubicación" placeholder="Ciudad" value={draft.listing.location} maxLength={80} onChange={(e) => patchListing({ location: e.target.value })} error={errors["listing.location"]} />
            <SelectField label="Modalidad" value={draft.listing.modality} placeholder="Elige la modalidad" onChange={(modality) => patchListing({ modality: modality as ListingDraft["modality"] })} options={MODALITIES} />
            <SelectField label="Contrato" value={draft.listing.contract} placeholder="Elige el tipo de contrato" onChange={(contract) => patchListing({ contract })} options={CONTRACTS.map((c) => ({ value: c, label: c }))} />
            <SelectField label="Jornada" value={draft.listing.schedule} placeholder="Elige la jornada" onChange={(schedule) => patchListing({ schedule })} options={SCHEDULES.map((s) => ({ value: s, label: s }))} />
            <div className="md:col-span-2">
              <TextField label="Salario" placeholder="Por ejemplo: $8 a $10 millones" value={draft.listing.salary} maxLength={80} onChange={(e) => patchListing({ salary: e.target.value })} error={errors["listing.salary"]} help="Vacío se publica como «A convenir»" />
            </div>
          </div>
        </section>

        <section className="card overflow-hidden animate-rise [animation-delay:180ms]" aria-label="Requisitos">
          <header className="flex items-baseline justify-between gap-4 px-7 pt-6 pb-4">
            <h2 className="text-[15px] font-semibold">Requisitos</h2>
            <span className="text-[12.5px] text-ink-3">
              {draft.requirements.length} en total, {mandatory} obligatorios
            </span>
          </header>
          <div className="hidden items-center gap-4 border-y border-border bg-bg/60 px-7 py-2.5 text-[12px] text-ink-3 md:flex">
            <span className="flex-1 pl-6">Requisito</span>
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
                onSuggestEquivalences={() => suggestFor(r)}
                onRemove={() => setDraft((d) => ({ ...d, requirements: d.requirements.filter((_, j) => j !== i) }))}
              />
            ))}
          </div>
          <Collapse open={Boolean(errors.requirements)}>
            <p className="px-7 pt-3 text-xs text-danger">{errors.requirements}</p>
          </Collapse>
          <div className="flex flex-wrap items-center gap-3 border-t border-border px-7 py-4">
            <button
              type="button"
              onClick={() => setDraft((d) => ({ ...d, requirements: [...d.requirements, emptyRequirement()] }))}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-dashed border-border-strong px-3.5 text-[13px] font-medium text-ink transition-colors duration-300 hover:border-ink hover:bg-hover"
            >
              <Plus aria-hidden className="size-3.5" />
              Añadir requisito
            </button>
            <Button variant="text" size="sm" icon={busy === "propose" ? <CribaCharacter mood="reading" size={18} /> : <ListPlus />} disabled={busy !== null && busy !== "propose"} onClick={propose}>
              {busy === "propose" ? "Criba está leyendo la descripción…" : "Proponer requisitos con Criba AI"}
            </Button>
          </div>
        </section>
      </section>

      <ScoringSidebar requirements={draft.requirements} autoInterview={draft.autoInterview} onAutoInterviewChange={(v) => patch({ autoInterview: v })} />
    </div>
  );
}
