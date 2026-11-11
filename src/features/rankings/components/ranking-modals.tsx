"use client";

import { useState } from "react";
import { Check, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { ResumeSheet } from "@/shared/components/resume/resume-sheet";
import { Button, DateField, Modal, Select, SelectField, TextArea, TextField, Toggle } from "@/shared/components/ui";
import { useToday } from "@/shared/hooks/use-today";
import { cn } from "@/shared/lib/cn";
import { formatShortDate } from "@/shared/lib/dates";
import { delay } from "@/shared/mocks";
import type { Equivalence } from "@/shared/types/domain";
import type { RankedCandidate, RankRequirement } from "../types/ranking";

/* Invitar a entrevista ------------------------------------------------ */

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "es-en", label: "Español, con 2 preguntas en inglés", hint: "Según los requisitos de la vacante" },
  { value: "en", label: "Inglés" },
];

export function InviteModal({ candidate, open, onClose, onSent }: { candidate: RankedCandidate | null; open: boolean; onClose: () => void; onSent: (deadline: Date) => void }) {
  const today = useToday();
  const [date, setDate] = useState<Date | null>(null);
  const [lang, setLang] = useState("es-en");
  const [notify, setNotify] = useState(true);
  const [busy, setBusy] = useState(false);
  const min = today ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) : undefined;
  const deadline = date ?? (today ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3) : null);

  async function send() {
    if (!deadline) return;
    setBusy(true);
    await delay(null, 900);
    setBusy(false);
    onSent(deadline);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title="Invitar a entrevista"
      description={candidate ? `${candidate.name} recibirá un enlace. La entrevista con IA dura unos 15 minutos y pregunta por lo que falta validar.` : undefined}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button icon={<Send />} loading={busy} onClick={send}>
            Enviar invitación
          </Button>
        </>
      }
    >
      <DateField label="Fecha límite para responder" kind="Elegir fecha" value={deadline} onChange={setDate} minDate={min} help="Solo fechas futuras" />
      <SelectField label="Idioma de la entrevista" kind="Elegir de la lista" options={LANGUAGES} value={lang} onChange={setLang} />
      <Toggle checked={notify} onChange={setNotify} label="Avisarme cuando termine" />
    </Modal>
  );
}

export function InvitedModal({ name, deadline, open, onClose, onNext }: { name: string; deadline: Date | null; open: boolean; onClose: () => void; onNext: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Invitación enviada" size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
          <circle cx="32" cy="32" r="30" className="fill-success-soft" />
          <circle cx="32" cy="32" r="30" fill="none" stroke="var(--success)" strokeWidth="2" className="done-circle" />
          <path d="M21 33l7 7 15-16" fill="none" stroke="var(--success)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="done-check" />
        </svg>
        <p className="text-[14px] text-ink-2">
          {name} tiene hasta el {deadline ? formatShortDate(deadline) : "plazo elegido"} para responder. Te avisamos cuando termine.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" block icon={<UserPlus />} onClick={onNext}>
          Invitar a otro
        </Button>
        <Button block onClick={onClose}>
          Listo
        </Button>
      </div>
    </Modal>
  );
}

/* Descartar con motivo ------------------------------------------------ */

const REASONS = [
  { value: "mandatory", label: "No cumple un requisito obligatorio" },
  { value: "experience", label: "Le falta experiencia para el nivel del cargo" },
  { value: "salary", label: "Expectativa salarial fuera del rango" },
  { value: "availability", label: "No tiene disponibilidad en la fecha" },
  { value: "withdrew", label: "Retiró su postulación" },
  { value: "other", label: "Otro motivo" },
];

export function DiscardModal({ candidate, open, onClose, onDiscard }: { candidate: RankedCandidate | null; open: boolean; onClose: () => void; onDiscard: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();

  function submit() {
    if (!reason) {
      setError("Elige un motivo");
      return;
    }
    if (reason === "other" && note.trim().length < 6) {
      setError("Cuéntanos el motivo en la nota");
      return;
    }
    onDiscard(REASONS.find((r) => r.value === reason)?.label ?? reason);
    setReason("");
    setNote("");
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={candidate ? `Descartar a ${candidate.name}` : "Descartar"}
      description="El motivo queda en la auditoría y la persona lo puede pedir."
      footer={
        <>
          <Button variant="text" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" icon={<Trash2 />} onClick={submit}>
            Descartar
          </Button>
        </>
      }
    >
      <SelectField
        label="Motivo"
        kind="Elegir de la lista"
        placeholder="Elige el motivo"
        options={REASONS}
        value={reason}
        error={reason ? undefined : error}
        help="Nunca se usan edad, género, foto ni origen como motivo"
        onChange={(v) => {
          setReason(v);
          setError(undefined);
        }}
      />
      <TextArea label="Nota para el equipo" kind="Opcional" placeholder="Qué viste y por qué" value={note} error={reason === "other" ? error : undefined} onChange={(e) => setNote(e.target.value)} minRows={2} maxRows={5} />
    </Modal>
  );
}

/* Marcar error de la IA ----------------------------------------------- */

const ERRORS = [
  { value: "equivalence", label: "Contó una tecnología que no es equivalente" },
  { value: "missed", label: "No vio algo que sí está en la hoja de vida" },
  { value: "years", label: "Calculó mal los años de experiencia" },
  { value: "citation", label: "La cita no dice lo que afirma" },
];

export function AiErrorModal({ candidate, requirements, requirementId, open, onClose, onSaved }: { candidate: RankedCandidate | null; requirements: RankRequirement[]; requirementId: string | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [kind, setKind] = useState("equivalence");
  const [req, setReq] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const value = req ?? requirementId ?? requirements[0]?.id ?? "";

  async function save() {
    setBusy(true);
    await delay(null, 700);
    setBusy(false);
    setReq(null);
    onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      dismissible={!busy}
      title="Marcar error de la IA"
      description={candidate ? `Esto corrige el puntaje de ${candidate.name} y ajusta las equivalencias de tu organización.` : undefined}
      footer={
        <>
          <Button variant="text" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button icon={<Check />} loading={busy} onClick={save}>
            Guardar corrección
          </Button>
        </>
      }
    >
      <SelectField label="Qué falló" kind="Elegir de la lista" options={ERRORS} value={kind} onChange={setKind} help="Queda registrado en Gobierno IA" />
      <SelectField label="Requisito afectado" kind="Elegir de la lista" options={requirements.map((r) => ({ value: r.id, label: r.description }))} value={value} onChange={setReq} />
    </Modal>
  );
}

/* Equivalencias ------------------------------------------------------- */

const PERCENTS = [100, 90, 80, 60, 40, 0].map((p) => ({ value: String(p), label: `${p} %` }));

export function EquivalencesModal({ requirement, open, onClose, onSaved }: { requirement: RankRequirement | null; open: boolean; onClose: () => void; onSaved: (list: Equivalence[]) => void }) {
  const [draft, setDraft] = useState<Equivalence[] | null>(null);
  const [label, setLabel] = useState("");
  const [percent, setPercent] = useState("80");
  const [adding, setAdding] = useState(false);
  const list = draft ?? requirement?.equivalences ?? [];

  function close() {
    setDraft(null);
    setAdding(false);
    onClose();
  }

  function add() {
    if (!label.trim()) return;
    setDraft([...list, { label: label.trim(), percent: Number(percent) }]);
    setLabel("");
    setAdding(false);
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={requirement ? `Equivalencias de ${requirement.description.split(/[ (,]/)[0]}` : "Equivalencias"}
      description="Cuánto cuenta una tecnología o experiencia parecida cuando la hoja de vida no dice exactamente lo pedido."
      footer={
        <>
          <Button variant="text" onClick={close}>
            Cancelar
          </Button>
          <Button
            icon={<Check />}
            onClick={() => {
              onSaved(list);
              setDraft(null);
            }}
          >
            Guardar
          </Button>
        </>
      }
    >
      <ul className="flex flex-col">
        {list.map((e, i) => (
          <li key={`${e.label}-${i}`} className="grid grid-cols-[1fr_120px_48px] items-center gap-4 border-b border-border py-3 text-[13.5px] animate-[option-in_300ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 50}ms` }}>
            <span>{e.label}</span>
            <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
              <span className={cn("grow-x block h-full rounded-full", e.percent >= 80 ? "bg-success" : e.percent >= 50 ? "bg-amber" : "bg-border-strong")} style={{ width: `${e.percent}%` }} />
            </span>
            <span className={cn("text-right font-mono text-[12.5px]", e.percent >= 80 ? "text-success" : e.percent >= 50 ? "text-warning" : "text-ink-3")}>{e.percent} %</span>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="flex items-end gap-2 animate-rise">
          <TextField label="Equivalencia" placeholder="Por ejemplo, GCP" value={label} onChange={(e) => setLabel(e.target.value)} containerClassName="flex-1" autoFocus />
          <Select aria-label="Cuánto cuenta" options={PERCENTS} value={percent} onChange={setPercent} className="w-[110px]" />
          <Button variant="outline" onClick={add}>
            Añadir
          </Button>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className="flex items-center gap-1.5 self-start text-[13.5px] text-blue hover:text-ink">
          <Plus aria-hidden className="size-4" />
          Añadir equivalencia
        </button>
      )}
    </Modal>
  );
}

/* Hoja de vida -------------------------------------------------------- */

export function ResumeModal({ candidate, open, onClose }: { candidate: RankedCandidate | null; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} size="lg" title={candidate ? `Hoja de vida de ${candidate.name}` : "Hoja de vida"} description="Al margen, qué requisito prueba cada línea y cuántos puntos aporta. Las notas son de Criba; el documento es el original.">
      {candidate ? (
        <div className="rounded-xl bg-surface-2 p-6">
          <ResumeSheet doc={candidate.resume} annotated score={candidate.score} reveal />
        </div>
      ) : null}
    </Modal>
  );
}
