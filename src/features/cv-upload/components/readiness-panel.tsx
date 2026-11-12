"use client";

import { Copy, FileQuestion, Loader2, Mail, ScanLine, Trash2 } from "lucide-react";
import { AnimatedNumber, Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { IngestFile } from "../types/ingest";

export type ReadingGroup = "read" | "busy" | "unreadable" | "duplicate" | "rejected";

export interface ReadinessPanelProps {
  files: IngestFile[];
  counts: Record<ReadingGroup, number>;
  active: ReadingGroup | null;
  onPick: (group: ReadingGroup | null) => void;
  onRequestAll: () => void;
  onRemoveDuplicates: () => void;
  onRemoveRejected: () => void;
}

const IMAGE = new Set(["JPG", "JPEG", "PNG", "HEIC", "WEBP", "TIFF"]);

/**
 * Qué tan lista está la vacante para evaluar y qué falta resolver. Cada
 * pendiente trae su acción en lote (pedir originales, quitar duplicadas) y
 * filtra la lista al tocarlo. Debajo, cómo llegaron los archivos.
 */
export function ReadinessPanel({ files, counts, active, onPick, onRequestAll, onRemoveDuplicates, onRemoveRejected }: ReadinessPanelProps) {
  const total = files.length;
  const pct = total ? Math.round((counts.read / total) * 100) : 0;
  const read = files.filter((f) => f.status === "READ");
  const byKind = {
    pdf: read.filter((f) => f.kind === "PDF").length,
    word: read.filter((f) => f.kind === "DOC" || f.kind === "DOCX").length,
    photo: read.filter((f) => IMAGE.has(f.kind)).length,
  };
  const requested = files.filter((f) => f.status === "UNREADABLE" && f.detail.startsWith("Pedimos")).length;

  const rows = [
    {
      key: "unreadable" as const,
      icon: ScanLine,
      tone: "text-danger",
      title: `${counts.unreadable} ilegibles`,
      text: requested ? `Ya pedimos el original de ${requested}. Llegan a esta misma lista.` : "Escaneos borrosos o fotos con reflejo. Pide el original a cada persona.",
      action: counts.unreadable && requested < counts.unreadable ? { label: "Pedir originales", icon: <Mail />, run: onRequestAll } : null,
    },
    {
      key: "duplicate" as const,
      icon: Copy,
      tone: "text-ink-2",
      title: `${counts.duplicate} duplicadas`,
      text: "La misma hoja de vida subida dos veces. Al quitarlas no se pierde nada.",
      action: counts.duplicate ? { label: "Quitar duplicadas", icon: <Trash2 />, run: onRemoveDuplicates } : null,
    },
    {
      key: "rejected" as const,
      icon: FileQuestion,
      tone: "text-warning",
      title: `${counts.rejected} rechazadas`,
      text: "Cartas, certificados o comprimidos. No son hojas de vida que se puedan evaluar.",
      action: counts.rejected ? { label: "Quitar rechazadas", icon: <Trash2 />, run: onRemoveRejected } : null,
    },
  ];

  return (
    <section className="card grid grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-5 border-b border-border px-7 py-6 lg:border-r lg:border-b-0">
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-ink-3">Listas para evaluar</span>
          <p className="font-head text-[40px] leading-none font-semibold tracking-[-0.02em]">
            <AnimatedNumber value={counts.read} className="text-success tabular-nums" />
            <span className="text-[22px] text-ink-3"> de {total}</span>
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="flex h-2 overflow-hidden rounded-full bg-surface-2">
            <span className="h-full rounded-full bg-success transition-[width] duration-700 ease-[var(--ease-out-soft)]" style={{ width: `${pct}%` }} />
            {counts.busy ? <span className="h-full animate-breathe bg-blue/60 transition-[width] duration-700" style={{ width: `${(counts.busy / total) * 100}%` }} /> : null}
          </span>
          <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
            {counts.busy ? (
              <>
                <Loader2 aria-hidden className="size-3.5 animate-spin text-blue" />
                Leyendo {counts.busy} {counts.busy === 1 ? "archivo" : "archivos"}
              </>
            ) : (
              `${pct} % de lo recibido se puede evaluar ya`
            )}
          </span>
        </div>
        <dl className="mt-auto grid grid-cols-3 gap-3 border-t border-border pt-4">
          {[
            ["PDF", byKind.pdf],
            ["Word", byKind.word],
            ["Fotos y escaneos", byKind.photo],
          ].map(([label, n]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-[12px] text-ink-3">{label}</dt>
              <dd className="text-[17px] font-semibold tabular-nums">{n}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col">
        <header className="flex items-baseline justify-between px-7 pt-5 pb-2">
          <h2 className="text-[14px] font-semibold">Qué falta resolver</h2>
          {active && active !== "read" && active !== "busy" ? (
            <button type="button" onClick={() => onPick(null)} className="text-[12.5px] text-blue hover:text-ink">
              Ver todo
            </button>
          ) : null}
        </header>
        <ul className="flex flex-col px-3 pb-3">
          {rows.map((r) => {
            const on = active === r.key;
            const empty = counts[r.key] === 0;
            return (
              <li key={r.key}>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl px-4 py-3.5 transition-colors duration-300",
                    on ? "bg-surface-2" : "hover:bg-hover",
                    empty && "opacity-50",
                  )}
                >
                  <button type="button" disabled={empty} aria-pressed={on} onClick={() => onPick(on ? null : r.key)} className="flex min-w-0 flex-1 items-start gap-3.5 text-left">
                    <r.icon aria-hidden className={cn("mt-0.5 size-[18px] shrink-0", r.tone)} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[14px] font-medium">{empty ? `Sin ${r.title.split(" ")[1]}` : r.title}</span>
                      <span className="text-[12.5px] leading-snug text-ink-3">{r.text}</span>
                    </span>
                  </button>
                  {r.action ? (
                    <Button variant="outline" size="sm" icon={r.action.icon} onClick={r.action.run} className="shrink-0">
                      {r.action.label}
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
