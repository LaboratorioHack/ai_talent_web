import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PortalApplication, PortalStage } from "../../types/portal";

export const STAGES: { key: PortalStage; label: string }[] = [
  { key: "received", label: "Recibida" },
  { key: "review", label: "En revisión" },
  { key: "interview", label: "Entrevista" },
  { key: "decision", label: "Decisión" },
];

/** Estado visible de una postulación: la etapa o cómo terminó. Solo texto con color, sin pastilla. */
export function outcomeLabel(a: PortalApplication): { label: string; text: string } {
  if (a.outcome === "selected") return { label: "Seleccionada", text: "text-success" };
  if (a.outcome === "closed") return { label: "No continúa", text: "text-ink-3" };
  if (a.outcome === "withdrawn") return { label: "Retirada", text: "text-ink-3" };
  if (a.stage === "interview") return { label: "Te toca responder", text: "text-amber" };
  return { label: STAGES.find((s) => s.key === a.stage)!.label, text: "text-ink-2" };
}

/**
 * Las cuatro etapas. `compact`: solo puntos y líneas (para filas).
 * Completo: puntos con su nombre debajo.
 */
export function StageTrack({ application: a, compact = false }: { application: PortalApplication; compact?: boolean }) {
  const current = STAGES.findIndex((s) => s.key === a.stage);
  const ended = a.outcome !== "open";
  const dot = compact ? "size-2.5" : "size-6";
  return (
    <ol className="flex items-center" aria-label={`Etapa: ${STAGES[current].label}`}>
      {STAGES.map((s, i) => {
        const done = i < current || (ended && i === current);
        const active = i === current && !ended;
        return (
          <li key={s.key} className={cn("flex items-center", i < STAGES.length - 1 && "flex-1")}>
            <span className="flex flex-col items-center gap-2">
              <span
                aria-current={active ? "step" : undefined}
                className={cn(
                  "relative flex shrink-0 items-center justify-center rounded-full transition-colors duration-500",
                  dot,
                  done ? (a.outcome === "closed" || a.outcome === "withdrawn" ? "bg-ink-3 text-bg" : "bg-success text-bg") : active ? "bg-amber text-bg" : compact ? "bg-border-strong" : "border-2 border-border-strong",
                  active && "shadow-[0_0_0_4px_rgba(242,169,59,0.18)]",
                )}
              >
                {!compact && done ? <Check aria-hidden className="size-3.5" /> : null}
              </span>
              {compact ? null : <span className={cn("text-[12px] whitespace-nowrap", active ? "font-medium text-ink" : "text-ink-3")}>{s.label}</span>}
            </span>
            {i < STAGES.length - 1 ? <span className={cn("mx-1.5 h-px flex-1", !compact && "-mt-6", i < current ? "bg-success" : "bg-border-strong")} /> : null}
          </li>
        );
      })}
    </ol>
  );
}
