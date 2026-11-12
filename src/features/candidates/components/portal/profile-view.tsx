"use client";

import { useRef, useState } from "react";
import { Download, EyeOff, FileText, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { Button, Modal, TextField, useToast } from "@/shared/components/ui";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { Applicant, ResumeSummary } from "../../types/portal";

/**
 * Mi perfil: datos de contacto, la hoja de vida, lo que la IA recibe de ella
 * (anonimizado) y los derechos sobre los datos (descargar o borrar todo).
 */
export function ProfileView({ applicant, resume: initial }: { applicant: Applicant; resume: ResumeSummary }) {
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [resume, setResume] = useState(initial);
  const [erase, setErase] = useState(false);
  const [typed, setTyped] = useState("");
  const updated = fromISODate(resume.updatedAt);

  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
      <header className="flex flex-col gap-2 animate-rise">
        <p className="eyebrow">Mi perfil</p>
        <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[36px]">Tus datos y tu hoja de vida</h1>
        <p className="max-w-[620px] text-[15px] text-ink-2">Tus datos de contacto solo los ve la empresa. A la IA le llega tu experiencia, sin nada que diga quién eres.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex min-w-0 flex-col gap-6">
          <section className="card flex flex-col gap-5 p-6 animate-rise [animation-delay:60ms]">
            <h2 className="font-head text-[19px] font-semibold">Datos de contacto</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField label="Nombre" defaultValue={applicant.name} />
              <TextField label="Correo" type="email" defaultValue={applicant.email} help="Para entrar al portal y recibir avisos" />
              <TextField label="Celular" defaultValue={applicant.phone} />
              <TextField label="Ciudad" defaultValue={applicant.city} />
            </div>
            <Button variant="outline" className="self-end" onClick={() => toast({ title: "Datos guardados" })}>
              Guardar cambios
            </Button>
          </section>

          <section className="card flex flex-col gap-5 p-6 animate-rise [animation-delay:120ms]">
            <div className="flex flex-col gap-1">
              <h2 className="flex items-center gap-2 font-head text-[19px] font-semibold">
                <EyeOff aria-hidden className="size-5 text-ink-3" />
                Lo que ve la IA
              </h2>
              <p className="text-[13.5px] text-ink-2">Así queda tu hoja de vida después de quitar los datos personales. Es lo único que se usa para compararte con el cargo.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {resume.anonymized.map((s) => (
                <div key={s.section} className="flex flex-col gap-2 rounded-2xl bg-bg/60 p-4 ring-1 ring-border">
                  <span className="text-[12px] font-medium tracking-wide text-ink-3 uppercase">{s.section}</span>
                  <ul className="flex flex-col gap-1.5">
                    {s.lines.map((l) => (
                      <li key={l} className="text-[13.5px] leading-snug">
                        {l}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-medium text-ink-2">Se quita antes de evaluar</span>
              <ul className="flex flex-wrap gap-1.5">
                {resume.removed.map((r) => (
                  <li key={r} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12.5px] text-ink-2 line-through decoration-ink-3/60">
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="card flex flex-col gap-4 p-6 animate-rise [animation-delay:90ms]">
            <h2 className="font-head text-[19px] font-semibold">Hoja de vida</h2>
            <div className="flex items-center gap-3 rounded-xl border border-border px-3 py-3">
              <span className="flex h-11 w-9 shrink-0 items-center justify-center rounded-[4px] border border-border bg-surface-2">
                <FileText aria-hidden className="size-4 text-ink-3" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span key={resume.fileName} className="truncate text-[14px] font-medium animate-[fade-in_300ms_var(--ease-out-soft)_both]">
                  {resume.fileName}
                </span>
                <span className="text-xs text-ink-3">
                  {Math.round(resume.sizeKb)} KB · actualizada el {updated ? formatLongDate(updated) : resume.updatedAt}
                </span>
              </span>
            </div>
            <p className="text-[13px] text-ink-2">Si la cambias, la usamos para tus próximas postulaciones. Las que ya enviaste se quedan con la versión de ese día.</p>
            <Button variant="outline" icon={<RefreshCw />} onClick={() => input.current?.click()}>
              Subir una versión nueva
            </Button>
            <input
              ref={input}
              type="file"
              hidden
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                setResume((r) => ({ ...r, fileName: f.name, sizeKb: f.size / 1024, updatedAt: "2026-11-11" }));
                toast({ title: "Hoja de vida actualizada", description: f.name });
                e.target.value = "";
              }}
            />
          </section>

          <section className="card flex flex-col gap-4 p-6 animate-rise [animation-delay:150ms]">
            <h2 className="flex items-center gap-2 font-head text-[19px] font-semibold">
              <ShieldCheck aria-hidden className="size-5 text-success" />
              Tus datos, tus reglas
            </h2>
            <p className="text-[13px] leading-relaxed text-ink-2">
              Autorizaste el tratamiento de tus datos para tus postulaciones (Ley 1581 de 2012). Puedes descargar todo lo que tenemos o pedir que lo borremos.
            </p>
            <Button variant="outline" icon={<Download />} onClick={() => toast({ title: "Preparando tus datos", description: "Te llega un correo con el archivo en unos minutos." })}>
              Descargar mis datos
            </Button>
            <Button variant="danger" icon={<Trash2 />} onClick={() => setErase(true)}>
              Borrar mi cuenta y mis datos
            </Button>
          </section>
        </div>
      </div>

      <Modal
        open={erase}
        onClose={() => {
          setErase(false);
          setTyped("");
        }}
        title="Borrar tu cuenta y tus datos"
        description="Se borran tu hoja de vida, tus postulaciones y tus entrevistas en todas las empresas. No se puede deshacer."
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
                toast({ title: "Pedido recibido", description: "Borramos todo en las próximas 24 horas y te confirmamos por correo." });
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
