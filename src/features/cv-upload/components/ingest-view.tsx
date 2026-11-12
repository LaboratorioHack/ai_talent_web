"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Play, X } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { PdfViewer } from "@/shared/components/pdf/pdf-viewer";
import { Button, CribaAi, EmptyState, Modal, ScrollArea, SearchField, Select, useToast } from "@/shared/components/ui";
import { resumeToPdf } from "@/shared/lib/resume-pdf";
import { mockResumeDocs } from "@/shared/mocks";
import type { ResumeDoc } from "@/shared/types/resume-doc";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { useIngest } from "../hooks/use-ingest";
import type { IngestData, IngestFile } from "../types/ingest";
import { AiReadingCard } from "./ai-reading-card";
import { CallPanel } from "./call-panel";
import { EvaluateModal } from "./evaluate-modal";
import { FileCard } from "./file-card";
import { ReadinessPanel } from "./readiness-panel";

type Group = "busy" | "read" | "unreadable" | "duplicate" | "rejected";
type Column = "busy" | "attention" | "read";

const groupOf = (f: IngestFile): Group =>
  f.status === "UPLOADING" || f.status === "PROCESSING" ? "busy" : f.status === "READ" ? "read" : f.status === "UNREADABLE" ? "unreadable" : f.status === "DUPLICATE" ? "duplicate" : "rejected";

const columnOf = (f: IngestFile): Column => {
  const g = groupOf(f);
  return g === "busy" || g === "read" ? g : "attention";
};

const ORDER: Record<Group, number> = { busy: 0, unreadable: 1, rejected: 2, duplicate: 3, read: 4 };
const GROUP_LABEL: Record<Group, string> = { read: "leídas", busy: "leyendo", unreadable: "ilegibles", duplicate: "duplicadas", rejected: "rechazadas" };

const COLUMNS: { key: Column; title: string; hint: string; dot: string }[] = [
  { key: "busy", title: "Recibidas", hint: "Criba AI las está leyendo", dot: "bg-blue" },
  { key: "attention", title: "Necesitan acción", hint: "Ilegibles, duplicadas o rechazadas", dot: "bg-warning" },
  { key: "read", title: "Listas para evaluar", hint: "Leídas y anonimizadas", dot: "bg-success" },
];



/** Mientras no exista el archivo real en Storage: una hoja de vida de ejemplo con el nombre del archivo. */
function docFromFile(fileName: string): ResumeDoc {
  const name = fileName
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/(_cv|_v\d+|_\d+|hv_|cv_)/gi, " ")
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
  const base = mockResumeDocs.a1;
  return { ...base, name: name || "Hoja de vida", contact: ["correo@ejemplo.com", "300 000 0000", "Colombia"] };
}

/**
 * Pantalla 07 · Postulaciones de una vacante. Arriba la convocatoria (enlace
 * público y canales); luego qué falta resolver y un tablero con las hojas de
 * vida según su lectura. Las hojas de vida llegan solo por la postulación.
 */
export function IngestView({ data }: { data: IngestData }) {
  const router = useRouter();
  const { toast } = useToast();
  const { files, read, remove, removeMany, requestOriginal } = useIngest(data.files);
  const [group, setGroup] = useState<Group | null>(null);
  const [query, setQuery] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [preview, setPreview] = useState<{ name: string; bytes: Uint8Array | null } | null>(null);

  async function openFile(f: IngestFile) {
    setPreview({ name: f.name, bytes: null });
    const { bytes } = await resumeToPdf(docFromFile(f.name));
    setPreview((p) => (p && p.name === f.name ? { ...p, bytes } : p));
  }

  const counts = useMemo(() => {
    const c: Record<Group, number> = { busy: 0, read: 0, unreadable: 0, duplicate: 0, rejected: 0 };
    files.forEach((f) => c[groupOf(f)]++);
    return c;
  }, [files]);
  const attention = counts.unreadable + counts.duplicate + counts.rejected;
  const applied = files.length;

  const columns = useMemo(() => {
    const q = query.trim().toLowerCase();
    const visible = files
      .filter((f) => !q || f.name.toLowerCase().includes(q))
      .sort((a, b) => ORDER[groupOf(a)] - ORDER[groupOf(b)]);
    const by: Record<Column, IngestFile[]> = { busy: [], attention: [], read: [] };
    visible.forEach((f) => {
      const col = columnOf(f);
      if (col === "attention" && group && group !== "busy" && group !== "read" && groupOf(f) !== group) return;
      by[col].push(f);
    });
    return by;
  }, [files, query, group]);

  function onRemove(id: string) {
    const file = files.find((f) => f.id === id);
    const undo = remove(id);
    toast({ title: "Archivo quitado", description: file?.name, action: { label: "Deshacer", onClick: undo } });
  }

  function onRequest(id: string) {
    requestOriginal(id);
    toast({ title: "Pedimos el original", description: "La persona recibe un correo con un enlace para subirlo de nuevo." });
  }

  const emptyJob = files.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <PageTop
        eyebrow={
          <nav aria-label="Ruta" className="flex items-center gap-1.5">
            <Link href={routes.vacancy(data.job.id)} className="transition-colors hover:text-ink">
              {data.job.title}
            </Link>
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-ink-2">Postulaciones</span>
          </nav>
        }
        title="Postulaciones"
        actions={
          <Select
            aria-label="Vacante"
            options={data.jobs}
            value={data.job.id}
            onChange={(id) => router.replace(`${routes.candidates}?job=${id}`, { scroll: false })}
            className="w-[300px] max-sm:w-full"
          />
        }
      />

      <div className="flex flex-col gap-6 px-4 pt-7 pb-8 sm:px-6 lg:px-12">
        <div className="flex flex-col animate-rise">
          <CallPanel jobId={data.job.id} open={data.job.open} closesAt={data.job.closesAt} applied={applied} read={counts.read} />
        </div>

        {emptyJob ? (
          <EmptyState
            title="Todavía nadie se postula"
            description="Comparte el enlace de la convocatoria. Cada hoja de vida aparece aquí apenas alguien se postula."
            className="mx-auto w-[520px] max-w-full bg-surface animate-rise"
          />
        ) : (
          <>
            <div className="animate-rise [animation-delay:80ms]">
              <ReadinessPanel
                files={files}
                counts={counts}
                active={group}
                onPick={setGroup}
                onRequestAll={() => {
                  const ids = files.filter((f) => f.status === "UNREADABLE").map((f) => f.id);
                  ids.forEach(requestOriginal);
                  toast({ title: `Pedimos ${ids.length} originales`, description: "Cada persona recibe un correo con un enlace para subirla de nuevo." });
                }}
                onRemoveDuplicates={() => {
                  const ids = files.filter((f) => f.status === "DUPLICATE").map((f) => f.id);
                  const undo = removeMany(ids);
                  toast({ title: `Quitaste ${ids.length} duplicadas`, description: "Se conserva la primera copia de cada una.", action: { label: "Deshacer", onClick: undo } });
                }}
                onRemoveRejected={() => {
                  const ids = files.filter((f) => f.status === "UNSUPPORTED" || f.status === "NO_DATA").map((f) => f.id);
                  const undo = removeMany(ids);
                  toast({ title: `Quitaste ${ids.length} archivos rechazados`, action: { label: "Deshacer", onClick: undo } });
                }}
              />
            </div>

            <section className="flex flex-col gap-4 animate-rise [animation-delay:140ms]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex flex-wrap items-center gap-2 font-head text-[20px] font-semibold tracking-[-0.01em]">
                  Tablero de hojas de vida
                  <CribaAi label="Lee, anonimiza y avisa lo que falta" />
                </h2>
                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <SearchField placeholder="Buscar archivo" containerClassName="min-w-0 flex-1 sm:w-[240px] sm:flex-none" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {COLUMNS.map((col) => {
                  const items = columns[col.key];
                  const filtered = col.key === "attention" && group && group !== "busy" && group !== "read";
                  return (
                    <div key={col.key} className="flex min-w-0 flex-col rounded-2xl border border-border bg-bg/60">
                      <header className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="flex items-center gap-2 text-[14px] font-semibold">
                            <span aria-hidden className={cn("size-2 rounded-full", col.dot, col.key === "busy" && items.length > 0 && "animate-breathe")} />
                            {col.title}
                            <span className="rounded-full bg-surface-2 px-2 py-px text-[12px] font-medium text-ink-2 tabular-nums">{items.length}</span>
                          </span>
                          <span className="text-[12.5px] text-ink-3">{col.hint}</span>
                        </div>
                        {filtered ? (
                          <button type="button" onClick={() => setGroup(null)} className="flex h-7 shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 text-[12px] text-ink-inverse animate-[pop-in_300ms_var(--ease-spring)_both]">
                            Solo {GROUP_LABEL[group]}
                            <X aria-hidden className="size-3" />
                          </button>
                        ) : null}
                      </header>
                      <ScrollArea className="h-[540px] max-lg:h-auto max-lg:max-h-[420px]" viewportClassName="px-3 pb-3">
                        {col.key === "busy" ? (
                          <div className="mb-2">
                            <AiReadingCard />
                          </div>
                        ) : null}
                        {items.length ? (
                          <ul className="flex flex-col gap-2">
                            {items.map((f, i) => (
                              <FileCard key={f.id} file={f} index={i} onRetry={(id) => read(id)} onRemove={onRemove} onRequestOriginal={onRequest} onOpen={openFile} />
                            ))}
                          </ul>
                        ) : (
                          <p className="px-2 py-10 text-center text-[13px] text-ink-3">
                            {col.key === "busy" ? "Las nuevas aparecen aquí mientras se leen." : col.key === "attention" ? "Nada pendiente. Todo se leyó bien." : "Aún no hay hojas de vida listas."}
                          </p>
                        )}
                      </ScrollArea>
                    </div>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </div>

      <div className="sticky bottom-0 z-20 mt-auto border-t border-border bg-surface/90 backdrop-blur-xl">
        <div className="flex flex-col items-stretch justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4 lg:px-12">
          <p className="text-[14px] text-ink-2">
            <strong className="font-semibold text-ink">{counts.read} listas para evaluar</strong>
            {attention ? `, ${attention} necesitan tu acción` : ""}
            {counts.busy ? `, ${counts.busy} leyéndose` : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              icon={<Clock />}
              onClick={() => {
                toast({ title: "Quedan guardadas", description: "Puedes evaluarlas cuando quieras desde la vacante." });
                router.push(routes.vacancy(data.job.id));
              }}
            >
              Evaluar después
            </Button>
            <Button icon={<Play />} disabled={!counts.read || counts.busy > 0} onClick={() => setEvaluating(true)}>
              {counts.busy ? "Esperando lectura" : `Evaluar ${counts.read} ahora`}
            </Button>
          </div>
        </div>
      </div>

      <Modal open={preview !== null} onClose={() => setPreview(null)} size="lg" title={preview?.name ?? ""} description="El archivo tal como llegó. Criba lo lee completo y quita los datos personales antes de evaluar.">
        {preview ? <PdfViewer data={preview.bytes} fileName={preview.name.replace(/\.docx?$/i, ".pdf")} className="h-[70vh]" /> : null}
      </Modal>

      <EvaluateModal open={evaluating} onClose={() => setEvaluating(false)} jobId={data.job.id} readable={counts.read} skipped={attention} requirements={data.job.requirements} />
    </div>
  );
}
