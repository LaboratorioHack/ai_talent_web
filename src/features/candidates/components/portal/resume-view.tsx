"use client";

import { useRef, useState } from "react";
import { Download, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { ResumeSheet } from "@/shared/components/resume/resume-sheet";
import { Button, Modal, TextArea, TextField, useToast } from "@/shared/components/ui";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/cn";
import type { ResumeDoc, ResumeLine } from "@/shared/types/resume-doc";
import type { ResumeSummary } from "../../types/portal";

const clone = (d: ResumeDoc): ResumeDoc => JSON.parse(JSON.stringify(d));

/**
 * Mi hoja de vida: primero se ve como documento; "Editar" abre el formulario
 * con la vista previa al lado, que cambia mientras escribes.
 */
export function ResumeView({ resume }: { resume: ResumeSummary }) {
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(resume.doc);
  const [draft, setDraft] = useState(resume.doc);
  const [file, setFile] = useState({ name: resume.fileName, updatedAt: resume.updatedAt });
  const [editing, setEditing] = useState(false);
  const [erase, setErase] = useState(false);
  const [typed, setTyped] = useState("");
  const updated = fromISODate(file.updatedAt);

  const patch = (fn: (d: ResumeDoc) => void) =>
    setDraft((d) => {
      const n = clone(d);
      fn(n);
      return n;
    });

  function save() {
    setSaved(draft);
    setEditing(false);
    setFile((f) => ({ ...f, updatedAt: "2026-11-11" }));
    toast({ title: "Hoja de vida guardada", description: "La usamos en tus próximas postulaciones." });
  }

  return (
    <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-8 px-4 pt-10 pb-20 sm:px-6 lg:px-8 lg:pt-14">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div className="flex flex-col gap-2">
          <h1 className="font-head text-[36px] leading-[1.02] font-semibold tracking-[-0.025em] sm:text-[52px]">
            Mi <span className="hl">hoja de vida</span>
          </h1>
          <p className="text-[14px] text-ink-3">
            {file.name}
            {updated ? ` · actualizada el ${formatLongDate(updated)}` : ""}
          </p>
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button
              variant="text"
              icon={<X />}
              onClick={() => {
                setDraft(saved);
                setEditing(false);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={save}>
              Guardar cambios
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" icon={<Upload />} onClick={() => input.current?.click()}>
              Subir otra versión
            </Button>
            <Button variant="outline" icon={<Download />} onClick={() => toast({ title: "Descargando PDF", description: file.name })}>
              Descargar
            </Button>
            <Button icon={<Pencil />} onClick={() => setEditing(true)}>
              Editar
            </Button>
          </div>
        )}
      </header>

      <div className={cn("grid grid-cols-1 gap-10", editing && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
        {editing ? (
          <form
            className="flex flex-col gap-8 animate-rise"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="flex flex-col gap-4">
              <h2 className="text-[13px] font-medium tracking-wide text-ink-3 uppercase">Encabezado</h2>
              <TextField label="Nombre" value={draft.name} onChange={(e) => patch((d) => void (d.name = e.target.value))} />
              <TextField label="Cargo o título" value={draft.headline} onChange={(e) => patch((d) => void (d.headline = e.target.value))} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {["Correo", "Celular", "Ciudad"].map((label, i) => (
                  <TextField key={label} label={label} value={draft.contact[i] ?? ""} onChange={(e) => patch((d) => void (d.contact[i] = e.target.value))} />
                ))}
              </div>
            </div>

            {draft.sections.map((sec, si) => (
              <div key={sec.title} className="flex flex-col gap-3 border-t border-border pt-6">
                <h2 className="text-[13px] font-medium tracking-wide text-ink-3 uppercase">{sec.title}</h2>
                {sec.lines.map((line, li) => (
                  <LineEditor
                    key={li}
                    line={line}
                    onChange={(l) => patch((d) => void (d.sections[si].lines[li] = l))}
                    onRemove={() => patch((d) => void d.sections[si].lines.splice(li, 1))}
                  />
                ))}
                <div className="flex flex-wrap gap-2">
                  {sec.title === "Experiencia" || sec.title === "Educación" ? (
                    <Button type="button" variant="text" size="sm" icon={<Plus />} onClick={() => patch((d) => void d.sections[si].lines.push({ kind: "role", text: "", right: "" }))}>
                      {sec.title === "Experiencia" ? "Agregar cargo" : "Agregar estudio"}
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="text"
                    size="sm"
                    icon={<Plus />}
                    onClick={() => patch((d) => void d.sections[si].lines.push({ kind: sec.title === "Experiencia" ? "bullet" : "text", text: "" }))}
                  >
                    {sec.title === "Experiencia" ? "Agregar logro" : "Agregar línea"}
                  </Button>
                </div>
              </div>
            ))}
          </form>
        ) : null}

        <div className={cn("flex flex-col gap-3", editing ? "lg:sticky lg:top-[96px] lg:self-start" : "mx-auto w-full max-w-[820px]")}>
          {editing ? <span className="text-[12.5px] text-ink-3">Así se ve mientras escribes</span> : null}
          <div key={editing ? "edit" : "view"} className="animate-rise">
            <ResumeSheet doc={editing ? draft : saved} compact={editing} />
          </div>
        </div>
      </div>

      {editing ? null : (
        <footer className="mx-auto flex w-full max-w-[820px] flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-[13px] text-ink-3">
          <span>Tus datos solo los ven las empresas a las que te postulas.</span>
          <span className="flex gap-4">
            <button type="button" className="transition-colors hover:text-ink" onClick={() => toast({ title: "Preparando tus datos", description: "Te llega un correo con el archivo." })}>
              Descargar mis datos
            </button>
            <button type="button" className="transition-colors hover:text-danger" onClick={() => setErase(true)}>
              Borrar mi cuenta
            </button>
          </span>
        </footer>
      )}

      <input
        ref={input}
        type="file"
        hidden
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setFile({ name: f.name, updatedAt: "2026-11-11" });
          toast({ title: "Leímos tu nueva hoja de vida", description: "Revisa la vista previa y edita lo que haga falta." });
          e.target.value = "";
        }}
      />

      <Modal
        open={erase}
        onClose={() => {
          setErase(false);
          setTyped("");
        }}
        title="Borrar tu cuenta"
        description="Se borran tu hoja de vida, tus postulaciones y tus entrevistas. No se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="text" onClick={() => setErase(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={typed.trim().toUpperCase() !== "BORRAR"}
              onClick={() => {
                setErase(false);
                setTyped("");
                toast({ title: "Pedido recibido", description: "Borramos todo en las próximas 24 horas." });
              }}
            >
              Borrar todo
            </Button>
          </>
        }
      >
        <TextField label='Escribe "BORRAR" para confirmar' value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
      </Modal>
    </div>
  );
}

function LineEditor({ line, onChange, onRemove }: { line: ResumeLine; onChange: (l: ResumeLine) => void; onRemove: () => void }) {
  const remove = (
    <button type="button" aria-label="Quitar línea" onClick={onRemove} className="mt-[30px] flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-hover hover:text-danger">
      <Trash2 aria-hidden className="size-4" />
    </button>
  );
  if (line.kind === "role") {
    return (
      <div className="flex items-start gap-2">
        <TextField label="Cargo o estudio" containerClassName="flex-1" value={line.text} onChange={(e) => onChange({ ...line, text: e.target.value })} />
        <TextField label="Fechas" containerClassName="w-[130px]" value={line.right ?? ""} onChange={(e) => onChange({ ...line, right: e.target.value })} />
        {remove}
      </div>
    );
  }
  if (line.kind === "text" && line.text.length > 60) {
    return (
      <div className="flex items-start gap-2">
        <TextArea label="Texto" containerClassName="flex-1" minRows={2} value={line.text} onChange={(e) => onChange({ ...line, text: e.target.value })} />
        {remove}
      </div>
    );
  }
  return (
    <div className={cn("flex items-start gap-2", line.kind === "bullet" && "pl-4")}>
      <TextField label={line.kind === "bullet" ? "Logro" : "Texto"} containerClassName="flex-1" value={line.text} onChange={(e) => onChange({ ...line, text: e.target.value })} />
      {remove}
    </div>
  );
}
