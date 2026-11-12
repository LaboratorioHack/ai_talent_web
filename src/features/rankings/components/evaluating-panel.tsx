"use client";

import { useEffect, useState } from "react";
import { Square, X } from "lucide-react";
import { Button, LogoMark, Modal, CribaAi } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";


export interface EvaluatingPanelProps {
  total: number;
  /** ms por hoja de vida en la simulación. */
  pace?: number;
  onDone: () => void;
  onCancelled: (done: number) => void;
}

/**
 * Pantalla 14 · Evaluando. La marca "criba" en bucle, una barra que avanza y
 * cuánto falta. Se puede salir; cancelar conserva lo ya evaluado.
 */
export function EvaluatingPanel({ total, pace = 230, onDone, onCancelled }: EvaluatingPanelProps) {
  const [done, setDone] = useState(0);
  const [asking, setAsking] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (asking) return;
    const t = window.setInterval(() => {
      setDone((d) => Math.min(total, d + 1 + (d % 3 === 0 ? 1 : 0)));
      setTick((n) => n + 1);
    }, pace);
    return () => window.clearInterval(t);
  }, [asking, pace, total]);

  useEffect(() => {
    if (done < total) return;
    const t = window.setTimeout(onDone, 700);
    return () => window.clearTimeout(t);
  }, [done, total, onDone]);

  const pct = Math.round((done / total) * 100);
  const secondsLeft = Math.max(1, Math.round(((total - done) * pace) / 1000 / 1.3));
  const wave = Math.floor(tick / 8);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center animate-rise">
      <div className="relative flex size-[84px] items-center justify-center rounded-[24px] bg-ink shadow-[0_20px_40px_-20px_rgba(21,32,27,0.6)]" aria-hidden>
        <span key={wave} className="absolute inset-0 rounded-[24px] ring-2 ring-amber/60 animate-[mark-pulse_1400ms_var(--ease-out-soft)_both]" />
        <LogoMark size={46} inverse />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-head text-[28px] font-semibold tracking-[-0.02em]">{done >= total ? "Listo, ordenando el ranking" : `Evaluando ${total} hojas de vida`}</h2>
        <p className="flex flex-wrap items-center justify-center gap-2 text-[14px] text-ink-2">
          <CribaAi label="Leyendo y comparando" />
          Puedes salir de esta pantalla; te avisamos al terminar.
        </p>
      </div>
      <div className="flex w-[440px] flex-col gap-2">
        <span className="h-2 overflow-hidden rounded-full bg-surface-2" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Hojas de vida evaluadas">
          <span className={cn("relative block h-full rounded-full bg-ink transition-[width] duration-300 ease-out", "after:absolute after:inset-0 after:animate-shimmer after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] after:bg-[length:200%_100%]")} style={{ width: `${pct}%` }} />
        </span>
        <span className="flex justify-between text-[13px] text-ink-3 tabular-nums">
          <span>
            {done} de {total}
          </span>
          <span>{done >= total ? "terminado" : `quedan unos ${secondsLeft} s`}</span>
        </span>
      </div>
      {done < total ? (
        <Button variant="text" icon={<X />} onClick={() => setAsking(true)}>
          Cancelar evaluación
        </Button>
      ) : null}

      <Modal
        open={asking}
        onClose={() => setAsking(false)}
        title="Cancelar la evaluación"
        description={`Van ${done} de ${total}. Lo evaluado se conserva; el resto queda como "Sin evaluar" y puedes retomarlo después.`}
        footer={
          <>
            <Button variant="text" onClick={() => setAsking(false)}>
              Seguir evaluando
            </Button>
            <Button variant="danger" icon={<Square />} onClick={() => onCancelled(done)}>
              Cancelar evaluación
            </Button>
          </>
        }
      />
    </div>
  );
}
