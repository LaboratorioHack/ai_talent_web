"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button, CribaAi, CribaCharacter, CribaThinking } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import { useCribaWork } from "@/shared/lib/criba-work";

export interface EvaluatingPanelProps {
  total: number;
  /** Evaluaciones que ya están guardadas (se cuentan desde la API mientras corre). */
  done: number;
  /** La evaluación sigue en el servidor: salir no la detiene. */
  onLeave: () => void;
}

/**
 * Pantalla 14 · Evaluando. La marca "criba" en bucle y una barra con lo que
 * de verdad ya está evaluado. Se puede salir: Criba AI termina en el servidor.
 */
export function EvaluatingPanel({ total, done, onLeave }: EvaluatingPanelProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 1400);
    return () => window.clearInterval(t);
  }, []);

  const finished = done >= total;
  useCribaWork(!finished, `Evalúa ${total} hojas de vida y cita la evidencia`, "thinking");
  // Lo que va haciendo, con el avance real que cuenta la API (no una animación sin datos).
  const thoughts = [
    "Una lectura rápida revisa primero los requisitos obligatorios",
    "Busco en cada hoja de vida la línea que prueba cada requisito",
    ...Array.from({ length: Math.min(done, total) }, (_, i) => `Terminé la evaluación ${i + 1} de ${total}`),
    ...(finished ? ["Ordeno el ranking por ajuste al perfil"] : []),
  ];
  // Mientras no hay ninguna lista, la barra muestra un mínimo para que se vea que empezó.
  const pct = Math.max(6, Math.min(100, Math.round((done / Math.max(1, total)) * 100)));

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center animate-rise">
      <div className="relative flex size-[84px] items-center justify-center rounded-[24px] bg-ink shadow-[0_20px_40px_-20px_rgba(21,32,27,0.6)]" aria-hidden>
        <span key={tick} className="absolute inset-0 rounded-[24px] ring-2 ring-amber/60 animate-[mark-pulse_1400ms_var(--ease-out-soft)_both]" />
        <CribaCharacter size={50} inverse announce mood={finished ? "done" : done > 0 ? "thinking" : "reading"} />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-head text-[28px] font-semibold tracking-[-0.02em]">{finished ? "Listo, ordenando el ranking" : `Criba AI está evaluando ${total} hojas de vida`}</h2>
        <p className="flex flex-wrap items-center justify-center gap-2 text-[14px] text-ink-2">
          <CribaAi label="Leyendo y comparando" />
          Puedes salir de esta pantalla; la evaluación sigue.
        </p>
      </div>
      <div className="flex w-full max-w-[440px] flex-col gap-2">
        <span className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Hojas de vida evaluadas">
          <span className={cn("relative block h-full rounded-full bg-ink transition-[width] duration-500 ease-out", "after:absolute after:inset-0 after:animate-shimmer after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] after:bg-[length:200%_100%]")} style={{ width: `${pct}%` }} />
        </span>
        <span className="flex justify-between text-[13px] text-ink-3 tabular-nums">
          <span>
            {Math.min(done, total)} de {total}
          </span>
          <span>{finished ? "terminado" : "cada hoja de vida toma unos segundos"}</span>
        </span>
      </div>
      <CribaThinking thoughts={thoughts} working={!finished} title="Criba AI está evaluando" className="w-full max-w-[520px] text-left" />
      {!finished ? (
        <Button variant="text" icon={<ArrowLeft />} onClick={onLeave}>
          Volver al ranking
        </Button>
      ) : null}
    </div>
  );
}
