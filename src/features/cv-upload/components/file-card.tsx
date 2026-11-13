"use client";

import { Ban, Check, Copy, FileQuestion, Loader2, Mail, ScanLine, Trash2, type LucideIcon } from "lucide-react";
import { Tooltip } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { IngestFile, IngestStatus } from "../types/ingest";

const STATUS: Record<IngestStatus, { label: string; icon: LucideIcon; tone: string }> = {
  PROCESSING: { label: "Leyendo", icon: Loader2, tone: "bg-blue-soft text-blue" },
  READ: { label: "Leída", icon: Check, tone: "bg-success-soft text-success" },
  UNREADABLE: { label: "Ilegible", icon: ScanLine, tone: "bg-danger-soft text-danger" },
  DUPLICATE: { label: "Duplicada", icon: Copy, tone: "bg-surface-2 text-ink-2" },
  UNSUPPORTED: { label: "No soportado", icon: Ban, tone: "bg-danger-soft text-danger" },
  NO_DATA: { label: "No es hoja de vida", icon: FileQuestion, tone: "bg-warning-soft text-warning" },
};

export interface FileCardProps {
  file: IngestFile;
  index: number;
  onRemove: (id: string) => void;
  onRequestOriginal: (id: string) => void;
  /** Abre el archivo en el lector (solo los PDF y Word ya leídos). */
  onOpen?: (file: IngestFile) => void;
}

/** Tarjeta de una postulación en el tablero: archivo, canal, qué se leyó y su acción. */
export function FileCard({ file, index, onRemove, onRequestOriginal, onOpen }: FileCardProps) {
  const openable = Boolean(onOpen) && file.status === "READ" && /^(PDF|DOCX?)$/.test(file.kind);
  const s = STATUS[file.status];
  const busy = file.status === "PROCESSING";
  const icon = "flex size-8 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-hover hover:text-ink";

  return (
    <li
      className="group flex flex-col gap-2.5 rounded-xl border border-border bg-surface p-3.5 shadow-[0_1px_2px_rgba(21,32,27,0.04)] transition-[box-shadow,border-color] duration-300 hover:border-border-strong animate-[option-in_380ms_var(--ease-out-soft)_both]"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-8 shrink-0 items-center justify-center rounded-[4px] border border-border bg-surface-2 font-mono text-[9px] font-semibold tracking-wide text-ink-2">{file.kind.slice(0, 4)}</span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          {openable ? (
            <button type="button" onClick={() => onOpen?.(file)} className="truncate text-left text-[13.5px] font-medium underline-offset-4 transition-colors hover:text-amber hover:underline">
              {file.name}
            </button>
          ) : (
            <span className="truncate text-[13.5px] font-medium">{file.name}</span>
          )}
          <span className="line-clamp-2 text-[12.5px] text-ink-3">{file.detail}</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span key={file.status} className={cn("inline-flex items-center gap-1 rounded-full py-[3px] pr-2 pl-1.5 text-[11.5px] font-medium whitespace-nowrap animate-[pop-in_380ms_var(--ease-spring)_both]", s.tone)}>
          <s.icon aria-hidden className={cn("size-3", file.status === "PROCESSING" && "animate-spin")} />
          {s.label}
        </span>
        <span className="truncate text-[11.5px] text-ink-3">{file.person}</span>
        <span className="ml-auto flex gap-0.5 opacity-70 transition-opacity group-hover:opacity-100">
          {file.status === "UNREADABLE" ? (
            <>
              <Tooltip content="Pedir el original">
                <button type="button" aria-label={`Pedir original de ${file.name}`} className={icon} onClick={() => onRequestOriginal(file.id)}>
                  <Mail aria-hidden className="size-3.5" />
                </button>
              </Tooltip>
            </>
          ) : null}
          {!busy ? (
            <Tooltip content="Quitar de esta vacante">
              <button type="button" aria-label={`Quitar ${file.name}`} className={cn(icon, "hover:text-danger")} onClick={() => onRemove(file.id)}>
                <Trash2 aria-hidden className="size-3.5" />
              </button>
            </Tooltip>
          ) : null}
        </span>
      </div>
    </li>
  );
}
