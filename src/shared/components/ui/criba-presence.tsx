"use client";

import { useEffect, useState } from "react";
import { useCribaJobs, type CribaJob } from "@/shared/lib/criba-work";
import { cn } from "@/shared/lib/cn";
import { CribaCharacter } from "./criba-character";

const DONE_MS = 1600;

/**
 * Criba AI trabajando, en cualquier pantalla: el personaje y lo que está
 * haciendo, abajo a la izquierda (los avisos van a la derecha). Aparece cuando
 * empieza un trabajo de la IA, dice «Listo» al terminar y se va.
 */
export function CribaPresence() {
  const jobs = useCribaJobs();
  const current = jobs.at(-1) ?? null;
  const [shown, setShown] = useState<CribaJob | null>(null);
  const [phase, setPhase] = useState<"hidden" | "working" | "done">("hidden");

  // Ajuste durante el render: entra al empezar un trabajo y pasa a «Listo» cuando no queda ninguno.
  if (current && (current !== shown || phase !== "working")) {
    setShown(current);
    setPhase("working");
  } else if (!current && phase === "working") {
    setPhase("done");
  }

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(() => setPhase("hidden"), DONE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const visible = phase !== "hidden";
  const others = jobs.length - 1;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed bottom-6 left-6 z-50 flex max-w-[min(420px,calc(100vw-3rem))] items-center gap-3 rounded-2xl bg-ink py-2.5 pr-4 pl-3 text-ink-inverse shadow-[0_18px_40px_-16px_rgba(21,32,27,0.65)] ring-1 ring-amber/40",
        "transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)]",
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
      )}
    >
      {shown ? (
        <>
          <span className="relative flex size-9 shrink-0 items-center justify-center">
            {phase === "working" ? <span aria-hidden className="absolute inset-0 rounded-xl ring-2 ring-amber/50 animate-[mark-pulse_1400ms_var(--ease-out-soft)_infinite]" /> : null}
            <CribaCharacter mood={phase === "done" ? "done" : shown.mood} size={30} inverse />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-amber uppercase">{phase === "done" ? "Criba AI · listo" : "Criba AI · trabajando"}</span>
            <span className="truncate text-[13.5px] leading-snug">
              {phase === "done" ? "Terminó. Revisa el resultado." : shown.label}
              {phase === "working" && others > 0 ? <span className="text-ink-inverse/60"> · y {others} más</span> : null}
            </span>
          </span>
        </>
      ) : null}
    </div>
  );
}
