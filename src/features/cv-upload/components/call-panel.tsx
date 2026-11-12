"use client";

import { useSyncExternalStore } from "react";
import { Copy, ExternalLink, Upload } from "lucide-react";
import { Button, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/cn";

const noop = () => () => {};

export interface CallPanelProps {
  jobId: string;
  open: boolean;
  closesAt: string;
  applied: number;
  uploaded: number;
  uploading: boolean;
  onToggleUpload: () => void;
}

/**
 * La convocatoria de la vacante: su enlace público, hasta cuándo recibe y
 * cuántas hojas de vida llegaron por cada canal. Subir en bloque queda como
 * acción secundaria para lo que llegó por otros medios.
 */
export function CallPanel({ jobId, open, closesAt, applied, uploaded, uploading, onToggleUpload }: CallPanelProps) {
  const { toast } = useToast();
  // El origen solo existe en el navegador; en el servidor se muestra la ruta.
  const origin = useSyncExternalStore(noop, () => window.location.origin, () => "");
  const path = routes.apply(jobId);
  const url = `${origin}${path}`;
  const closes = fromISODate(closesAt);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Enlace copiado", description: "Compártelo donde publiques la vacante." });
    } catch {
      toast({ tone: "error", title: "No se pudo copiar", description: url });
    }
  }

  return (
    <section className="card grid grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
      <div className="flex flex-col gap-4 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] font-medium", open ? "bg-success-soft text-success" : "bg-surface-2 text-ink-2")}>
            <span aria-hidden className={cn("size-1.5 rounded-full", open ? "bg-success animate-breathe" : "bg-ink-3")} />
            {open ? "Convocatoria abierta" : "Convocatoria cerrada"}
          </span>
          {open && closes ? <span className="text-[13px] text-ink-3">Recibe postulaciones hasta el {formatLongDate(closes)}</span> : null}
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="font-head text-[21px] leading-tight font-semibold tracking-[-0.01em]">Las personas se postulan con este enlace</h2>
          <p className="text-[13.5px] text-ink-2">Ven el cargo, suben su hoja de vida y autorizan el uso de sus datos. Cada postulación aparece abajo y Criba AI la lee sola.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="field-box flex h-11 min-w-0 flex-1 items-center px-3.5 text-[13.5px] text-ink-2">
            <span className="truncate">{url || path}</span>
          </span>
          <div className="flex gap-2">
            <Button variant="outline" icon={<Copy />} onClick={copy} disabled={!open}>
              Copiar
            </Button>
            <Button variant="text" icon={<ExternalLink />} onClick={() => window.open(path, "_blank", "noopener")}>
              Ver
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between gap-5 border-t border-border bg-bg/40 px-5 py-5 sm:px-7 sm:py-6 lg:border-t-0 lg:border-l">
        <dl className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <dt className="text-[12.5px] text-ink-3">Se postularon</dt>
            <dd className="font-head text-[30px] leading-none font-semibold tabular-nums">{applied}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-[12.5px] text-ink-3">Subidas por tu equipo</dt>
            <dd className="font-head text-[30px] leading-none font-semibold tabular-nums">{uploaded}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] text-ink-3">¿Te llegaron hojas de vida por correo o en una carpeta? Súbelas en bloque y entran a la misma lista.</p>
          <Button variant={uploading ? "ink" : "outline"} icon={<Upload />} onClick={onToggleUpload} className="self-start">
            {uploading ? "Cerrar carga" : "Subir hojas de vida"}
          </Button>
        </div>
      </div>
    </section>
  );
}
