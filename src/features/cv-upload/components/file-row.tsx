"use client";

import Image from "next/image";
import { Ban, Check, Copy, FileQuestion, Loader2, Mail, RotateCcw, ScanLine, Trash2, Upload, type LucideIcon } from "lucide-react";
import { Tooltip } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { IngestFile, IngestSource, IngestStatus } from "../types/ingest";

const STATUS: Record<IngestStatus, { label: string; icon: LucideIcon; tone: string }> = {
  UPLOADING: { label: "Subiendo", icon: Upload, tone: "bg-blue-soft text-blue" },
  PROCESSING: { label: "Leyendo", icon: Loader2, tone: "bg-blue-soft text-blue" },
  READ: { label: "Leída", icon: Check, tone: "bg-success-soft text-success" },
  UNREADABLE: { label: "Ilegible", icon: ScanLine, tone: "bg-danger-soft text-danger" },
  DUPLICATE: { label: "Duplicada", icon: Copy, tone: "bg-surface-2 text-ink-2" },
  UNSUPPORTED: { label: "No soportado", icon: Ban, tone: "bg-danger-soft text-danger" },
  NO_DATA: { label: "No es hoja de vida", icon: FileQuestion, tone: "bg-warning-soft text-warning" },
};

const SOURCE: Record<IngestSource, { label: string; logo?: string }> = {
  upload: { label: "Subida a mano" },
  greenhouse: { label: "Greenhouse", logo: "/logos/greenhouse.png" },
  drive: { label: "Google Drive", logo: "/logos/gdrive.png" },
  linkedin: { label: "LinkedIn", logo: "/logos/linkedin.png" },
};

const size = (kb: number) => (kb >= 1024 ? `${(kb / 1024).toFixed(1).replace(".", ",")} MB` : `${kb} KB`);

export interface FileRowProps {
  file: IngestFile;
  index: number;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onRequestOriginal: (id: string) => void;
}

/** Una hoja de vida en la lista: tipo, nombre, qué se leyó, origen, estado y acciones. */
export function FileRow({ file, index, onRetry, onRemove, onRequestOriginal }: FileRowProps) {
  const s = STATUS[file.status];
  const src = SOURCE[file.source];
  const busy = file.status === "UPLOADING" || file.status === "PROCESSING";
  const icon = "flex size-9 items-center justify-center rounded-lg text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink";

  return (
    <li
      className="group relative grid grid-cols-[44px_1fr_auto_auto] items-center gap-4 border-b border-border py-3.5 pr-2 last:border-0 animate-[option-in_380ms_var(--ease-out-soft)_both]"
      style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
    >
      <span className={cn("flex h-11 w-9 items-center justify-center rounded-[5px] border font-mono text-[9.5px] font-semibold tracking-wide", file.status === "READ" ? "border-border bg-surface text-ink-2" : "border-border bg-surface-2 text-ink-3")}>{file.kind.slice(0, 4)}</span>

      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-[14px] font-medium">{file.name}</span>
        <span className="flex items-center gap-2 text-[12.5px] text-ink-3">
          {src.logo ? <Image src={src.logo} alt="" width={14} height={14} className="size-3.5 object-contain" /> : null}
          <span className="truncate">
            {file.detail}
            {file.status === "READ" ? `, ${file.pages} ${file.pages === 1 ? "pág." : "págs."} ${size(file.sizeKb)}` : ""}
          </span>
        </span>
        {file.status === "UPLOADING" ? (
          <span className="mt-1 h-1 w-full max-w-[360px] overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-blue transition-[width] duration-300 ease-out" style={{ width: `${file.progress ?? 0}%` }} />
          </span>
        ) : null}
      </div>

      <span key={file.status} className={cn("inline-flex items-center gap-1.5 rounded-full py-[5px] pr-2.5 pl-2 text-[12.5px] font-medium whitespace-nowrap animate-[pop-in_380ms_var(--ease-spring)_both]", s.tone)}>
        <s.icon aria-hidden className={cn("size-3", file.status === "PROCESSING" && "animate-spin")} />
        {file.status === "UPLOADING" ? `${file.progress ?? 0} %` : s.label}
      </span>

      <span className="flex w-[116px] justify-end gap-0.5">
        {file.status === "UNREADABLE" ? (
          <>
            <Tooltip content="Pedir el original al candidato">
              <button type="button" aria-label={`Pedir original de ${file.name}`} className={icon} onClick={() => onRequestOriginal(file.id)}>
                <Mail aria-hidden className="size-4" />
              </button>
            </Tooltip>
            <Tooltip content="Intentar leer de nuevo">
              <button type="button" aria-label={`Leer de nuevo ${file.name}`} className={icon} onClick={() => onRetry(file.id)}>
                <RotateCcw aria-hidden className="size-4" />
              </button>
            </Tooltip>
          </>
        ) : null}
        {!busy ? (
          <Tooltip content="Quitar de esta vacante">
            <button type="button" aria-label={`Quitar ${file.name}`} className={cn(icon, "hover:text-danger")} onClick={() => onRemove(file.id)}>
              <Trash2 aria-hidden className="size-4" />
            </button>
          </Tooltip>
        ) : null}
      </span>
      <span className="sr-only">{src.label}</span>
    </li>
  );
}
