"use client";

import { useEffect, useState } from "react";
import { Check, Plus, Send, Trash2, UserPlus } from "lucide-react";
import { PdfViewer } from "@/shared/components/pdf/pdf-viewer";
import { ResumeSheet } from "@/shared/components/resume/resume-sheet";
import { Button, Collapse, DateField, Modal, Segmented, Select, SelectField, TextArea, TextField } from "@/shared/components/ui";
import { CopyLink } from "@/shared/components/share/copy-link";
import { useToday } from "@/shared/hooks/use-today";
import { cn } from "@/shared/lib/cn";
import { formatShortDate } from "@/shared/lib/dates";
import { resumeToPdf } from "@/shared/lib/resume-pdf";
import { getResumeFile, isPdf, saveFile } from "@/shared/lib/application-api";
import { flagAiError, inviteToInterview, type AiErrorKind, type InterviewInvitation, type InterviewLanguage } from "../api/actions";
import type { Equivalence } from "@/shared/types/domain";
import type { RankedCandidate, RankRequirement } from "../types/ranking";

/* Invitar a entrevista ------------------------------------------------ */

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "es-en", label: "Español, con 2 preguntas en inglés", hint: "Según los requisitos de la vacante" },
  { value: "en", label: "Inglés" },
];

export function InviteModal({ vacancyId, candidate, open, onClose, onSent }: { vacancyId: string; candidate: RankedCandidate | null; open: boolean; onClose: () => void; onSent: (deadline: Date, invitation: InterviewInvitation) => void }) {
  const today = useToday();
  const [date, setDate] = useState<Date | null>(null);
  const [lang, setLang] = useState("es-en");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const min = today ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) : undefined;
  const deadline = date ?? (today ? new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3) : null);

  async function send() {
    if (!deadline || !candidate) return;
    setBusy(true);
    setError(null);
    try {
      onSent(deadline, await inviteToInterview(vacancyId, candidate.id, deadline, lang as InterviewLanguage));
    } catch (e) {
      setError(e instanceof Error && /evaluate/i.test(e.message) ? "Evalúa primero la hoja de vida." : "No se pudo enviar la invitación. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
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
      <Collapse open={Boolean(error)}>
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      </Collapse>
    </Modal>
  );
}

export function InvitedModal({ name, deadline, invitation, open, onClose, onNext }: { name: string; deadline: Date | null; invitation: InterviewInvitation | null; open: boolean; onClose: () => void; onNext: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Invitación enviada" size="sm">
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
          <circle cx="32" cy="32" r="30" className="fill-success-soft" />
          <circle cx="32" cy="32" r="30" fill="none" stroke="var(--success)" strokeWidth="2" className="done-circle" />
          <path d="M21 33l7 7 15-16" fill="none" stroke="var(--success)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="done-check" />
        </svg>
        <p className="text-[14px] text-ink-2">
          {name} tiene hasta el {deadline ? formatShortDate(deadline) : "plazo elegido"} para responder {invitation ? `${invitation.questions} preguntas` : "la entrevista"}.{" "}
          {invitation?.emailSent ? "Le enviamos el enlace por correo." : "No pudimos enviar el correo: comparte el enlace."}
        </p>
        {invitation ? <CopyLink url={invitation.link} /> : null}
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

export function AiErrorModal({ vacancyId, candidate, requirements, requirementId, open, onClose, onSaved }: { vacancyId: string; candidate: RankedCandidate | null; requirements: RankRequirement[]; requirementId: string | null; open: boolean; onClose: () => void; onSaved: () => void }) {
  const [kind, setKind] = useState("equivalence");
  const [req, setReq] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const value = req ?? requirementId ?? requirements[0]?.id ?? "";

  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!candidate) return;
    setBusy(true);
    setError(null);
    try {
      await flagAiError(vacancyId, candidate.id, kind as AiErrorKind, value || null);
      setReq(null);
      onSaved();
    } catch {
      setError("No se pudo guardar la corrección. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
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
      <Collapse open={Boolean(error)}>
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      </Collapse>
    </Modal>
  );
}

/* Equivalencias ------------------------------------------------------- */

const PERCENTS = [100, 90, 80, 60, 40, 0].map((p) => ({ value: String(p), label: `${p} %` }));

export function EquivalencesModal({ requirement, open, busy = false, onClose, onSaved }: { requirement: RankRequirement | null; open: boolean; busy?: boolean; onClose: () => void; onSaved: (list: Equivalence[]) => void }) {
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
            loading={busy}
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

export function ResumeModal({ vacancyId, candidate, open, onClose }: { vacancyId: string; candidate: RankedCandidate | null; open: boolean; onClose: () => void }) {
  const [view, setView] = useState<"pdf" | "review">("pdf");
  const [loaded, setLoaded] = useState<{ id: string; pdf: Uint8Array; source: "file" | "word" | "criba"; original: Awaited<ReturnType<typeof getResumeFile>> } | null>(null);
  const doc = candidate?.resume;
  // Lo cargado vale solo para la persona abierta; al cambiar, el lector espera el nuevo archivo.
  const current = loaded && candidate && loaded.id === candidate.id ? loaded : null;
  const pdf = current?.pdf ?? null;
  const source = current?.source ?? null;
  const original = current?.original ?? null;
  const fileName = candidate ? `${candidate.name.toLowerCase().replace(/\s+/g, "_")}_cv` : "hoja_de_vida";

  // El archivo que envió la persona. Si es Word o ya no está en el almacenamiento, se muestra lo que leyó Criba AI.
  useEffect(() => {
    if (!open || !candidate || !doc) return;
    let cancelled = false;
    (async () => {
      const file = await getResumeFile(vacancyId, candidate.id).catch(() => null);
      if (cancelled) return;
      if (file && isPdf(file)) {
        setLoaded({ id: candidate.id, pdf: file.bytes, source: "file", original: file });
        return;
      }
      const marked = new Set<string>();
      doc.sections.forEach((sec, si) => sec.lines.forEach((l, li) => l.note && marked.add(`s${si}-l${li}`)));
      const generated = await resumeToPdf(doc, marked);
      if (cancelled) return;
      setLoaded({ id: candidate.id, pdf: generated.bytes, source: file ? "word" : "criba", original: file });
    })();
    return () => {
      cancelled = true;
    };
  }, [open, candidate, doc, vacancyId]);

  return (
    <Modal open={open} onClose={onClose} size="lg" title={candidate ? `Hoja de vida de ${candidate.name}` : "Hoja de vida"} description="El archivo tal como llegó. En la revisión, qué requisito prueba cada línea y cuántos puntos aporta.">
      {candidate ? (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Segmented
              aria-label="Vista"
              size="sm"
              value={view}
              onChange={setView}
              items={[
                { value: "pdf", label: "Archivo" },
                { value: "review", label: "Revisión de Criba" },
              ]}
            />
            {source === "word" && original ? (
              <Button variant="text" size="sm" onClick={() => saveFile(original, `${fileName}.docx`)}>
                Descargar el Word original
              </Button>
            ) : null}
          </div>
          {source && source !== "file" ? (
            <p className="text-[12.5px] text-ink-3">{source === "word" ? "La persona envió un Word: abajo, lo que leyó Criba AI de ese archivo." : "El archivo original ya no está disponible: abajo, lo que leyó Criba AI."}</p>
          ) : null}
          {view === "pdf" ? (
            <PdfViewer data={pdf} fileName={`${fileName}.pdf`} className="h-[68vh]" />
          ) : (
            <div className="rounded-xl bg-surface-2 p-6">
              <ResumeSheet doc={candidate.resume} annotated score={candidate.score} reveal />
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
