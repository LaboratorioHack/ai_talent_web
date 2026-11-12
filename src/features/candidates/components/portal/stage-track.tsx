import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PortalApplication, PortalStage } from "../../types/portal";

export const STAGES: { key: PortalStage; label: string }[] = [
  { key: "received", label: "Recibida" },
  { key: "review", label: "En revisión" },
  { key: "interview", label: "Entrevista" },
  { key: "decision", label: "Decisión" },
];

/** Estado visible de una postulación: la etapa o cómo terminó. */
export function outcomeLabel(a: PortalApplication): { label: string; tone: string } {
  if (a.outcome === "selected") return { label: "Seleccionada", tone: "bg-success-soft text-success" };
  if (a.outcome === "closed") return { label: "No continúa", tone: "bg-surface-2 text-ink-2" };
  if (a.outcome === "withdrawn") return { label: "Retirada", tone: "bg-surface-2 text-ink-3" };
  if (a.stage === "interview") return { label: "Entrevista pendiente", tone: "bg-warning-soft text-warning" };
  return { label: STAGES.find((s) => s.key === a.stage)!.label, tone: "bg-blue-soft text-blue" };
}

/** Las cuatro etapas del proceso con la actual resaltada. */
export function StageTrack({ application: a, compact = false }: { application: PortalApplication; compact?: boolean }) {
  const current = STAGES.findIndex((s) => s.key === a.stage);
  const ended = a.outcome !== "open";
  return (
    <ol className="flex items-center" aria-label="Etapas del proceso">
      {STAGES.map((s, i) => {
        const done = i < current || (ended && i === current);
        const active = i === current && !ended;
        return (
          <li key={s.key} className={cn("flex items-center", i < STAGES.length - 1 && "flex-1")}>
            <span className="flex flex-col items-center gap-1.5">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "relative flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-500",
                  done && (a.outcome === "closed" || a.outcome === "withdrawn") ? "border-ink-3 bg-ink-3 text-ink-inverse" : done ? "border-success bg-success text-ink-inverse" : active ? "border-amber bg-surface" : "border-border-strong bg-surface",
                )}
              >
                {done ? <Check aria-hidden className="size-3.5" /> : active ? <span className="size-2 rounded-full bg-amber animate-breathe" /> : null}
              </span>
              {compact ? null : <span className={cn("text-[11.5px] whitespace-nowrap", active ? "font-medium text-ink" : "text-ink-3")}>{s.label}</span>}
            </span>
            {i < STAGES.length - 1 ? <span className={cn("mx-1.5 h-[2px] flex-1 rounded-full", compact ? "" : "-mt-5", i < current ? "bg-success" : "bg-border")} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
