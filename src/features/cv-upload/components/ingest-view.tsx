"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Play, X } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { AnimatedNumber, Button, EmptyState, SearchField, Segmented, Select, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { useIngest } from "../hooks/use-ingest";
import type { IngestData, IngestFile, IngestSource } from "../types/ingest";
import { ConnectFolderModal } from "./connect-folder-modal";
import { Dropzone } from "./dropzone";
import { EvaluateModal } from "./evaluate-modal";
import { FileRow } from "./file-row";

type Group = "busy" | "read" | "unreadable" | "duplicate" | "rejected";
type View = "all" | "attention" | "read";

const groupOf = (f: IngestFile): Group =>
  f.status === "UPLOADING" || f.status === "PROCESSING" ? "busy" : f.status === "READ" ? "read" : f.status === "UNREADABLE" ? "unreadable" : f.status === "DUPLICATE" ? "duplicate" : "rejected";

const ORDER: Record<Group, number> = { busy: 0, unreadable: 1, rejected: 2, duplicate: 3, read: 4 };

const COUNTERS: { group: Group; label: string; tone: string; hint: string }[] = [
  { group: "read", label: "Leídas", tone: "text-success", hint: "Listas para evaluar" },
  { group: "busy", label: "Leyendo", tone: "text-blue", hint: "Tardan unos segundos" },
  { group: "unreadable", label: "Ilegibles", tone: "text-danger", hint: "Pide el original" },
  { group: "duplicate", label: "Duplicadas", tone: "text-ink-2", hint: "Se cuentan una vez" },
  { group: "rejected", label: "Rechazadas", tone: "text-danger", hint: "No son hojas de vida" },
];

const SAMPLES = [
  { name: "andrea_gomez_cv.pdf", sizeKb: 212 },
  { name: "hoja de vida carlos ruiz.docx", sizeKb: 88 },
  { name: "foto_cv_luisa_fernanda.jpg", sizeKb: 1840 },
  { name: "cv_scan_borroso.pdf", sizeKb: 2200 },
  { name: "carta_presentacion_2.pdf", sizeKb: 36 },
  { name: "proyectos_finales.zip", sizeKb: 12400 },
  { name: "sebastian_vega.pdf", sizeKb: 201 },
];

const SOURCES: { value: "all" | IngestSource; label: string }[] = [
  { value: "all", label: "Todas las fuentes" },
  { value: "upload", label: "Subidas a mano" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "drive", label: "Google Drive" },
];

const PAGE = 24;

/** Pantalla 07 · Candidatos · Ingesta de hojas de vida de una vacante. */
export function IngestView({ data }: { data: IngestData }) {
  const router = useRouter();
  const { toast } = useToast();
  const { files, add, read, remove, requestOriginal } = useIngest(data.files);
  const [view, setView] = useState<View>("attention");
  const [group, setGroup] = useState<Group | null>(null);
  const [source, setSource] = useState<"all" | IngestSource>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);
  const [evaluating, setEvaluating] = useState(false);
  const [folder, setFolder] = useState(false);

  const counts = useMemo(() => {
    const c: Record<Group, number> = { busy: 0, read: 0, unreadable: 0, duplicate: 0, rejected: 0 };
    files.forEach((f) => c[groupOf(f)]++);
    return c;
  }, [files]);
  const attention = counts.unreadable + counts.duplicate + counts.rejected;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return files
      .filter((f) => (group ? groupOf(f) === group : view === "all" ? true : view === "read" ? groupOf(f) === "read" : groupOf(f) !== "read"))
      .filter((f) => source === "all" || f.source === source)
      .filter((f) => !q || f.name.toLowerCase().includes(q))
      .sort((a, b) => ORDER[groupOf(a)] - ORDER[groupOf(b)]);
  }, [files, group, view, source, query]);

  function upload(list: { name: string; sizeKb: number }[], from: IngestSource = "upload", label?: string) {
    const n = add(list, from);
    setGroup(null);
    setView("attention");
    toast({ title: `${n} ${n === 1 ? "archivo" : "archivos"} ${label ? `desde ${label}` : "subiendo"}`, description: "Aparecen arriba mientras Criba los lee." });
  }

  function onRemove(id: string) {
    const file = files.find((f) => f.id === id);
    const undo = remove(id);
    toast({ title: "Archivo quitado", description: file?.name, action: { label: "Deshacer", onClick: undo } });
  }

  function onRequest(id: string) {
    requestOriginal(id);
    toast({ title: "Pedimos el original", description: "El candidato recibe un correo con un enlace para subirlo de nuevo." });
  }

  const emptyJob = data.files.length === 0 && files.length === 0;

  return (
    <div className="flex flex-1 flex-col">
      <PageTop
        eyebrow={
          <nav aria-label="Ruta" className="flex items-center gap-1.5">
            <Link href={routes.vacancy(data.job.id)} className="transition-colors hover:text-ink">
              {data.job.title}
            </Link>
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-ink-2">Hojas de vida</span>
          </nav>
        }
        title="Hojas de vida"
        actions={
          <Select
            aria-label="Vacante"
            options={data.jobs}
            value={data.job.id}
            onChange={(id) => router.replace(`${routes.candidates}?job=${id}`, { scroll: false })}
            className="w-[300px]"
          />
        }
      />

      <div className="flex flex-col gap-6 px-12 pt-7 pb-8">
        <div className="animate-rise">
          <Dropzone onFiles={(list) => upload(list)} onSample={() => upload(SAMPLES)} onConnectFolder={() => setFolder(true)} />
        </div>

        {emptyJob ? null : (
          <div className="grid grid-cols-5 overflow-hidden rounded-2xl border border-border bg-surface animate-rise [animation-delay:80ms]">
            {COUNTERS.map((c) => {
              const active = group === c.group;
              return (
                <button
                  key={c.group}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setGroup(active ? null : c.group)}
                  className={cn(
                    "relative flex items-center gap-4 border-r border-border px-6 py-5 text-left transition-colors duration-300 last:border-0 hover:bg-surface-2/60",
                    active && "bg-surface-2",
                  )}
                >
                  <AnimatedNumber value={counts[c.group]} className={cn("font-head text-[34px] leading-none font-semibold tabular-nums", counts[c.group] ? c.tone : "text-ink-3")} />
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[14px] font-medium">{c.label}</span>
                    <span className="text-[12px] text-ink-3">{c.hint}</span>
                  </span>
                  <span className={cn("absolute inset-x-6 bottom-0 h-[2px] origin-left rounded-full bg-ink transition-transform duration-500 ease-[var(--ease-out-soft)]", active ? "scale-x-100" : "scale-x-0")} />
                </button>
              );
            })}
          </div>
        )}

        {emptyJob ? (
          <EmptyState
            title="Esta vacante todavía no tiene hojas de vida"
            description="Arrástralas arriba, conecta una carpeta o prueba con los archivos de ejemplo."
            className="mx-auto w-[520px] bg-surface animate-rise"
          />
        ) : (
          <section className="card flex flex-col px-6 pt-5 pb-3 animate-rise [animation-delay:140ms]">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
              <div className="flex items-center gap-3">
                <Segmented
                  aria-label="Qué mostrar"
                  size="sm"
                  value={view}
                  onChange={(v) => {
                    setView(v);
                    setGroup(null);
                  }}
                  items={[
                    { value: "attention", label: "Necesitan acción", count: attention + counts.busy },
                    { value: "read", label: "Leídas", count: counts.read },
                    { value: "all", label: "Todas", count: files.length },
                  ]}
                />
                {group ? (
                  <button type="button" onClick={() => setGroup(null)} className="flex h-8 items-center gap-1.5 rounded-full bg-ink px-3 text-[12.5px] text-ink-inverse animate-[pop-in_300ms_var(--ease-spring)_both]">
                    Solo {COUNTERS.find((c) => c.group === group)?.label.toLowerCase()}
                    <X aria-hidden className="size-3.5" />
                  </button>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <Select aria-label="Fuente" options={SOURCES} value={source} onChange={(v) => setSource(v as "all" | IngestSource)} className="w-[200px]" triggerClassName="field-box h-10 w-full px-3.5 text-[13.5px] text-ink" />
                <SearchField placeholder="Buscar archivo" containerClassName="w-[240px]" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
            </div>

            {visible.length === 0 ? (
              <p className="py-12 text-center text-[14px] text-ink-3">{view === "attention" && !group ? "Nada pendiente. Todas las hojas de vida se leyeron bien." : "Ningún archivo coincide con el filtro."}</p>
            ) : (
              <ul className="flex flex-col">
                {visible.slice(0, limit).map((f, i) => (
                  <FileRow key={f.id} file={f} index={i} onRetry={(id) => read(id)} onRemove={onRemove} onRequestOriginal={onRequest} />
                ))}
              </ul>
            )}
            {visible.length > limit ? (
              <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="my-2 self-center rounded-full px-4 py-2 text-[13px] text-ink-2 ring-1 ring-border transition-[color,box-shadow] hover:text-ink hover:ring-border-strong">
                Ver {Math.min(PAGE, visible.length - limit)} más de {visible.length - limit}
              </button>
            ) : null}
          </section>
        )}
      </div>

      <div className="sticky bottom-0 z-20 mt-auto border-t border-border bg-surface/90 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4 px-12 py-4">
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

      <EvaluateModal open={evaluating} onClose={() => setEvaluating(false)} jobId={data.job.id} readable={counts.read} skipped={attention} requirements={data.job.requirements} />
      <ConnectFolderModal
        open={folder}
        onClose={() => setFolder(false)}
        onConnected={(list, provider) => {
          setFolder(false);
          upload(list, "drive", provider);
        }}
      />
    </div>
  );
}
