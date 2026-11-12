"use client";

import { useRef, useState, type DragEvent } from "react";
import { Files, FolderOpen } from "lucide-react";
import { Button } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { IncomingFile } from "../hooks/use-ingest";

export interface DropzoneProps {
  onFiles: (files: IncomingFile[]) => void;
  onSample: () => void;
}

const SHEETS = [
  { rest: "-rotate-[9deg] -translate-x-7", over: "-rotate-[16deg] -translate-x-14 -translate-y-3", delay: "0s" },
  { rest: "rotate-[7deg] translate-x-7", over: "rotate-[15deg] translate-x-14 -translate-y-3", delay: "-2s" },
  { rest: "", over: "-translate-y-6 scale-105", delay: "-4s" },
];

/**
 * Zona para soltar hojas de vida. Acepta cualquier formato y estructura; lo
 * que no se pueda leer se marca después en la lista. En reposo, tres hojas
 * flotan despacio; al arrastrar encima se abren y suben.
 */
export function Dropzone({ onFiles, onSample }: DropzoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  function take(list: FileList | null) {
    if (!list?.length) return;
    onFiles(Array.from(list, (f) => ({ name: f.name, sizeKb: f.size / 1024 })));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setOver(false);
    take(e.dataTransfer.files);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!over) setOver(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(false);
      }}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col items-start gap-6 overflow-hidden rounded-2xl border-[1.5px] border-dashed px-5 py-6 sm:flex-row sm:items-center sm:gap-10 sm:px-10 sm:py-8 transition-[border-color,background-color,box-shadow] duration-500 ease-[var(--ease-out-soft)]",
        over ? "border-amber bg-[color-mix(in_oklab,var(--amber)_7%,var(--surface))] shadow-[0_0_0_6px_rgba(242,169,59,0.12)]" : "border-border-strong bg-surface",
      )}
    >
      <div aria-hidden className="relative hidden h-[118px] w-[150px] shrink-0 items-center justify-center sm:flex">
        {SHEETS.map((s, i) => (
          <span key={i} className="absolute animate-[float_6s_ease-in-out_infinite]" style={{ animationDelay: s.delay }}>
            <span
              className={cn(
                "block h-[96px] w-[74px] rounded-[5px] border border-border bg-surface shadow-[0_14px_30px_-16px_rgba(21,32,27,0.45)] transition-transform duration-700 ease-[var(--ease-spring)]",
                over ? s.over : s.rest,
              )}
            >
              <span className="mx-2.5 mt-3 block h-[5px] w-9 rounded-full bg-ink/70" />
              <span className="mx-2.5 mt-2 block h-[3px] rounded-full bg-ink/15" />
              <span className="mx-2.5 mt-1.5 block h-[3px] w-10 rounded-full bg-ink/15" />
              <span className="mx-2.5 mt-3 block h-[3px] rounded-full bg-ink/15" />
              <span className="mx-2.5 mt-1.5 block h-[3px] w-8 rounded-full bg-ink/15" />
              {i === 2 ? <span className={cn("mx-2.5 mt-2.5 block h-[3px] rounded-full transition-colors duration-500", over ? "bg-amber" : "bg-ink/15")} /> : null}
            </span>
          </span>
        ))}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="font-head text-[21px] leading-tight font-semibold tracking-[-0.01em]">{over ? "Suéltalas aquí" : "Sube las hojas de vida que te llegaron por otros medios"}</p>
          <p className="max-w-[560px] text-[14px] text-ink-2">Correo, carpetas o ferias: arrástralas aquí en bloque. PDF, Word, fotos o escaneos; Criba quita la foto, la edad y los datos de contacto antes de evaluar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" icon={<FolderOpen />} onClick={() => input.current?.click()}>
            Elegir archivos
          </Button>
          <span aria-hidden className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <Button variant="text" icon={<Files />} onClick={onSample}>
            Probar con archivos de ejemplo
          </Button>
        </div>
      </div>

      <input ref={input} type="file" multiple hidden accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.heic,application/pdf" onChange={(e) => {
        take(e.target.files);
        e.target.value = "";
      }} />
    </div>
  );
}
