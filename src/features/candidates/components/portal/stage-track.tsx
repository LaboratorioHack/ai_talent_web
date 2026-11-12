import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { PortalApplication, PortalStage } from "../../types/portal";

export const STAGES: { key: PortalStage; label: string }[] = [
  { key: "received", label: "Recibida" },
  { key: "review", label: "En revisión" },
  { key: "interview", label: "Entrevista" },
  { key: "decision", label: "Decisión" },
];

/** Estado visible de una postulación: la etapa o cómo terminó. Solo texto con color. */
export function outcomeLabel(a: PortalApplication): { label: string; text: string } {
  if (a.outcome === "selected") return { label: "Seleccionada", text: "text-success" };
  if (a.outcome === "closed") return { label: "No continúa", text: "text-ink-3" };
  if (a.outcome === "withdrawn") return { label: "Retirada", text: "text-ink-3" };
  if (a.stage === "interview") return { label: "Te toca responder", text: "text-amber" };
  return { label: STAGES.find((s) => s.key === a.stage)!.label, text: "text-ink-2" };
}

/** La etapa que viene, para decir "Sigue: …". */
export function nextStage(a: PortalApplication): string | null {
  if (a.outcome !== "open") return null;
  const i = STAGES.findIndex((s) => s.key === a.stage);
  return STAGES[i + 1]?.label ?? null;
}

/**
 * Las cuatro etapas. El tramo recorrido se llena al entrar y el punto actual
 * late en ámbar. `compact`: solo puntos (filas); completo: con nombres.
 */
export function StageTrack({ application: a, compact = false, delay = 0 }: { application: PortalApplication; compact?: boolean; delay?: number }) {
  const current = STAGES.findIndex((s) => s.key === a.stage);
  const ended = a.outcome !== "open";
  const muted = a.outcome === "closed" || a.outcome === "withdrawn";
  const dot = compact ? "size-2.5" : "size-6";
  return (
    <ol className="flex items-center" aria-label={`Etapa: ${STAGES[current].label}`}>
      {STAGES.map((s, i) => {
        const done = i < current || (ended && i === current);
        const active = i === current && !ended;
        return (
          <li key={s.key} className={cn("flex items-center", i < STAGES.length - 1 && "flex-1")}>
            <span className="flex flex-col items-center gap-2">
              <span aria-current={active ? "step" : undefined} className={cn("relative flex shrink-0 items-center justify-center rounded-full", dot, done ? (muted ? "bg-ink-3 text-bg" : "bg-success text-bg") : active ? "bg-amber text-bg" : compact ? "bg-border-strong" : "border-2 border-border-strong")}>
                {active ? <span aria-hidden className="absolute -inset-1.5 rounded-full bg-amber/30 animate-breathe" /> : null}
                {!compact && done ? <Check aria-hidden className="size-3.5" /> : null}
              </span>
              {compact ? null : <span className={cn("text-[12px] whitespace-nowrap", active ? "font-medium text-ink" : "text-ink-3")}>{s.label}</span>}
            </span>
            {i < STAGES.length - 1 ? (
              <span className={cn("relative mx-1.5 h-[2px] flex-1 overflow-hidden rounded-full bg-border-strong", !compact && "-mt-6")}>
                {i < current ? <span className={cn("rail-fill absolute inset-0 rounded-full", muted ? "bg-ink-3" : "bg-success")} style={{ animationDelay: `${delay + i * 180}ms` }} /> : null}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
