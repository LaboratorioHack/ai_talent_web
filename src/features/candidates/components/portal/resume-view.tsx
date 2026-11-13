"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Eye, FileClock, Highlighter, MousePointerClick, PencilLine, Plus, Trash2, Upload } from "lucide-react";
import { PdfViewer, type PdfHotspot } from "@/shared/components/pdf/pdf-viewer";
import { Button, Modal, Segmented, TextArea, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { resumeToPdf, type ResumePdf } from "@/shared/lib/resume-pdf";
import type { ResumeDoc, ResumeLine } from "@/shared/types/resume-doc";
import { downloadMyData, eraseMyData, uploadErrorMessage, uploadMyResume } from "../../api/portal-actions";
import type { PortalApplication, ResumeSummary } from "../../types/portal";

type Mode = "view" | "edit" | "highlight";

const MODES: { value: Mode; label: string; icon: typeof Eye }[] = [
  { value: "view", label: "Ver", icon: Eye },
  { value: "edit", label: "Editar texto", icon: PencilLine },
  { value: "highlight", label: "Resaltar", icon: Highlighter },
];

const clone = (d: ResumeDoc): ResumeDoc => JSON.parse(JSON.stringify(d));
const day = (iso: string) => {
  const d = fromISODate(iso);
  return d ? formatLongDate(d) : iso;
};

/**
 * Mi hoja de vida como PDF real. "Ver" es el lector; "Editar texto" vuelve
 * clicable cada línea del PDF y la edita en el panel con el PDF regenerándose
 * al instante; "Resaltar" marca líneas en ámbar dentro del PDF.
 */
export function ResumeView({ resume, applications }: { resume: ResumeSummary; applications: PortalApplication[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"save" | "upload" | "export" | "erase" | null>(null);
  const [saved, setSaved] = useState(resume.doc);
  const [doc, setDoc] = useState(resume.doc);
  const [highlights, setHighlights] = useState<Set<string>>(new Set());
  const [savedHighlights, setSavedHighlights] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<Mode>("view");
  const [active, setActive] = useState<string | null>(null);
  const [pdf, setPdf] = useState<ResumePdf | null>(null);
  const [file, setFile] = useState({ name: resume.fileName, updatedAt: resume.updatedAt });
  const [confirmErase, setConfirmErase] = useState(false);
  const [typed, setTyped] = useState("");

  // Regenera el PDF un momento después de cada cambio.
  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      resumeToPdf(doc, highlights).then((r) => !cancelled && setPdf(r));
    }, 180);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [doc, highlights]);

  const dirty = JSON.stringify(doc) !== JSON.stringify(saved) || [...highlights].sort().join() !== [...savedHighlights].sort().join();
  const hotspots: PdfHotspot[] = useMemo(() => (mode === "view" || !pdf ? [] : pdf.boxes.map((b) => ({ ...b, label: mode === "edit" ? "Editar esta línea" : "Resaltar esta línea" }))), [mode, pdf]);
  const used = applications.filter((a) => a.outcome !== "withdrawn");

  const patch = (fn: (d: ResumeDoc) => void) =>
    setDoc((d) => {
      const n = clone(d);
      fn(n);
      return n;
    });

  function onHotspot(h: PdfHotspot) {
    if (mode === "highlight") {
      setHighlights((s) => {
        const n = new Set(s);
        if (n.has(h.key)) n.delete(h.key);
        else n.add(h.key);
        return n;
      });
      return;
    }
    setActive(h.key);
  }

  /** Sube un archivo como versión nueva; Criba AI la vuelve a leer y la página se recarga con lo leído. */
  async function upload(next: File, kind: "save" | "upload") {
    setBusy(kind);
    try {
      const result = await uploadMyResume(next);
      setFile({ name: next.name, updatedAt: new Date().toISOString().slice(0, 10) });
      if (kind === "save") {
        setSaved(doc);
        setSavedHighlights(new Set(highlights));
      }
      setActive(null);
      toast({
        title: result.status === "PROCESSED" ? "Hoja de vida guardada" : "Hoja de vida guardada; Criba AI la sigue leyendo",
        description: `Queda como versión actual en ${result.companies === 1 ? "la empresa" : `las ${result.companies} empresas`} a las que te postulaste.`,
      });
      router.refresh();
    } catch (error) {
      toast({ tone: "error", title: "No se pudo guardar", description: uploadErrorMessage(error) });
    } finally {
      setBusy(null);
    }
  }

  async function save() {
    // Lo que se ve es lo que se guarda: el PDF generado con las ediciones y los resaltados.
    const generated = pdf ?? (await resumeToPdf(doc, highlights));
    const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".pdf";
    await upload(new File([generated.bytes as BlobPart], name, { type: "application/pdf" }), "save");
  }

  async function exportData() {
    setBusy("export");
    try {
      await downloadMyData();
    } catch {
      toast({ tone: "error", title: "No pudimos preparar tus datos", description: "Intenta de nuevo en un momento." });
    } finally {
      setBusy(null);
    }
  }

  async function erase() {
    setBusy("erase");
    try {
      await eraseMyData();
      router.replace(routes.portalSignIn);
    } catch {
      toast({ tone: "error", title: "No pudimos borrar tus datos", description: "Intenta de nuevo en un momento." });
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-6 px-4 pt-10 pb-16 sm:px-6 lg:h-[calc(100dvh-var(--app-header)-1px)] lg:min-h-[640px] lg:px-8 lg:pt-10 lg:pb-8">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-rise">
        <div className="flex flex-col gap-2">
          <h1 className="font-head text-[36px] leading-[1.02] font-semibold tracking-[-0.025em] sm:text-[48px]">
            Mi <span className="hl">hoja de vida</span>
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-[14px] text-ink-3">
            {file.name} · actualizada el {day(file.updatedAt)}
            <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium transition-colors", dirty ? "bg-warning-soft text-warning" : "bg-success-soft text-success")}>
              {dirty ? null : <Check aria-hidden className="size-3" />}
              {dirty ? "Cambios sin guardar" : "Guardada"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            aria-label="Herramienta"
            items={MODES}
            value={mode}
            onChange={(m) => {
              setMode(m);
              setActive(null);
            }}
          />
          <Button variant="outline" icon={<Upload />} loading={busy === "upload"} disabled={busy !== null} onClick={() => input.current?.click()}>
            Subir otro PDF
          </Button>
          <Button disabled={!dirty || busy !== null} loading={busy === "save"} onClick={save}>
            Guardar
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_340px]">
        <PdfViewer
          data={pdf?.bytes ?? null}
          fileName={file.name}
          hotspots={hotspots}
          activeKey={active}
          onHotspot={onHotspot}
          initialZoom={0.75}
          className="h-[calc(100dvh-260px)] min-h-[480px] lg:h-full lg:min-h-0 animate-rise [animation-delay:60ms]"
        />

        <aside key={mode} className="flex flex-col gap-6 [&>*]:animate-rise [&>*:nth-child(2)]:[animation-delay:70ms] [&>*:nth-child(3)]:[animation-delay:140ms]">
          {mode === "edit" ? (
            active ? (
              <LineEditor key={active} doc={doc} lineKey={active} patch={patch} onClose={() => setActive(null)} />
            ) : (
              <Hint icon={MousePointerClick} title="Toca una línea del PDF" text="Se marca en ámbar y la editas aquí. El PDF cambia mientras escribes." />
            )
          ) : null}

          {mode === "edit" ? (
            <section className="panel flex flex-col gap-2 px-5 pt-4 pb-1">
              <h2 className="text-[12.5px] font-medium tracking-[0.08em] text-ink-3 uppercase">Agregar a una sección</h2>
              <ul className="flex flex-col divide-y divide-border">
                {doc.sections.map((s, si) => (
                  <li key={s.title} className="flex items-center justify-between py-2.5 text-[14px]">
                    <span>{s.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const kind: ResumeLine["kind"] = s.title === "Experiencia" || s.title === "Educación" ? "role" : "text";
                        patch((d) => void d.sections[si].lines.push(kind === "role" ? { kind, text: "", right: "" } : { kind, text: "" }));
                        setActive(`s${si}-l${s.lines.length}`);
                      }}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12.5px] text-ink-2 ring-1 ring-border transition-colors hover:text-ink hover:ring-border-strong"
                    >
                      <Plus aria-hidden className="size-3.5" />
                      Línea
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {mode === "highlight" ? (
            <Hint icon={Highlighter} title="Resalta lo más importante" text={`Toca las líneas que quieres destacar.${highlights.size ? ` Llevas ${highlights.size}.` : ""}`}>
              {highlights.size ? (
                <button type="button" className="self-start text-[13px] text-ink-3 hover:text-ink" onClick={() => setHighlights(new Set())}>
                  Quitar todos los resaltados
                </button>
              ) : null}
            </Hint>
          ) : null}

          {mode === "view" ? (
            <>
              <section className="panel flex flex-col gap-3 p-5">
                <h2 className="text-[12.5px] font-medium tracking-[0.08em] text-ink-3 uppercase">La reciben</h2>
                <ul className="flex flex-col divide-y divide-border">
                  {used.map((a) => (
                    <li key={a.id}>
                      <Link href={routes.portalApplication(a.id)} className="flex items-center justify-between gap-3 py-3 text-[14px] transition-colors hover:text-amber">
                        <span className="truncate">{a.jobTitle}</span>
                        <span className="shrink-0 text-[12px] text-ink-3">{day(a.appliedAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="panel flex flex-col gap-3 p-5">
                <h2 className="text-[12.5px] font-medium tracking-[0.08em] text-ink-3 uppercase">Versiones</h2>
                <ol className="flex flex-col">
                  {resume.versions.map((v, i) => (
                    <li key={`${v.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
                      {i < resume.versions.length - 1 ? <span aria-hidden className="absolute top-4 left-[7px] h-full w-px bg-border-strong" /> : null}
                      <FileClock aria-hidden className={cn("relative size-[15px] shrink-0", i === 0 ? "text-amber" : "text-ink-3")} />
                      <span className="flex flex-col">
                        <span className="text-[13.5px]">{i === 0 ? "Versión actual" : v.fileName}</span>
                        <span className="text-[12px] text-ink-3">{day(v.at)}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </section>
              <footer className="flex flex-wrap justify-center gap-6 px-1 text-[12.5px] text-ink-3">
                <button type="button" className="hover:text-ink disabled:opacity-50" disabled={busy === "export"} onClick={exportData}>
                  Descargar mis datos
                </button>
                <button type="button" className="hover:text-danger" onClick={() => setConfirmErase(true)}>
                  Borrar mi cuenta
                </button>
              </footer>
            </>
          ) : null}
        </aside>
      </div>

      <input
        ref={input}
        type="file"
        hidden
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) void upload(f, "upload");
        }}
      />

      <Modal
        open={confirmErase}
        onClose={() => {
          setConfirmErase(false);
          setTyped("");
        }}
        title="Borrar tu cuenta"
        description="Se borran tu hoja de vida, tus postulaciones y tus entrevistas. No se puede deshacer."
        size="sm"
        footer={
          <>
            <Button variant="text" onClick={() => setConfirmErase(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              disabled={typed.trim().toUpperCase() !== "BORRAR"}
              loading={busy === "erase"}
              onClick={erase}
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

function Hint({ icon: Icon, title, text, children }: { icon: typeof Eye; title: string; text: string; children?: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 rounded-2xl bg-amber/10 p-5 ring-1 ring-amber/25">
      <Icon aria-hidden className="size-5 text-amber" />
      <h2 className="text-[15px] font-semibold">{title}</h2>
      <p className="text-[13.5px] text-ink-2">{text}</p>
      {children}
    </section>
  );
}

/** Editor de la línea elegida en el PDF: encabezado o línea de una sección. */
function LineEditor({ doc, lineKey, patch, onClose }: { doc: ResumeDoc; lineKey: string; patch: (fn: (d: ResumeDoc) => void) => void; onClose: () => void }) {
  const head = lineKey.startsWith("head:") ? lineKey.slice(5) : null;
  const m = /^s(\d+)-l(\d+)$/.exec(lineKey);
  const si = m ? Number(m[1]) : -1;
  const li = m ? Number(m[2]) : -1;
  const line = si >= 0 ? doc.sections[si]?.lines[li] : undefined;

  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface p-5 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.6)] ring-1 ring-border animate-[pop-in_320ms_var(--ease-spring)_both]">
      <div className="flex items-center justify-between">
        <h2 className="text-[12.5px] font-medium tracking-[0.08em] text-amber uppercase">{head ? "Encabezado" : (doc.sections[si]?.title ?? "")}</h2>
        <button type="button" onClick={onClose} className="text-[12.5px] text-ink-3 hover:text-ink">
          Listo
        </button>
      </div>
      {head === "name" ? <TextField label="Nombre" autoFocus value={doc.name} onChange={(e) => patch((d) => void (d.name = e.target.value))} /> : null}
      {head === "headline" ? <TextField label="Cargo o título" autoFocus value={doc.headline} onChange={(e) => patch((d) => void (d.headline = e.target.value))} /> : null}
      {head === "contact"
        ? ["Correo", "Celular", "Ciudad"].map((label, i) => (
            <TextField key={label} label={label} autoFocus={i === 0} value={doc.contact[i] ?? ""} onChange={(e) => patch((d) => void (d.contact[i] = e.target.value))} />
          ))
        : null}
      {line ? (
        <>
          {line.kind === "role" ? (
            <>
              <TextField label="Cargo o estudio" autoFocus value={line.text} onChange={(e) => patch((d) => void (d.sections[si].lines[li].text = e.target.value))} />
              <TextField label="Fechas" value={line.right ?? ""} onChange={(e) => patch((d) => void (d.sections[si].lines[li].right = e.target.value))} />
            </>
          ) : (
            <TextArea label={line.kind === "bullet" ? "Logro" : line.kind === "sub" ? "Empresa" : "Texto"} autoFocus minRows={3} value={line.text} onChange={(e) => patch((d) => void (d.sections[si].lines[li].text = e.target.value))} />
          )}
          <div className="flex flex-wrap gap-2">
            {doc.sections[si].title === "Experiencia" ? (
              <Button variant="outline" size="sm" icon={<Plus />} onClick={() => patch((d) => void d.sections[si].lines.splice(li + 1, 0, { kind: "bullet", text: "" }))}>
                Logro debajo
              </Button>
            ) : null}
            <Button
              variant="text"
              size="sm"
              icon={<Trash2 />}
              className="text-ink-3 hover:text-danger"
              onClick={() => {
                patch((d) => void d.sections[si].lines.splice(li, 1));
                onClose();
              }}
            >
              Quitar línea
            </Button>
          </div>
        </>
      ) : null}
    </section>
  );
}
