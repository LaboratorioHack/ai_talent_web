"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { CribaAi } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

const STEPS = ["Lee el texto, aunque sea un escaneo", "Quita foto, edad y datos de contacto", "Saca experiencia, estudios e idiomas", "La deja lista para evaluar"];

/**
 * Criba AI leyendo una hoja de vida, a la vista: una hoja que se barre con la
 * franja ámbar y los pasos que se van cumpliendo en bucle.
 */
export function AiReadingCard() {
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setStep((s) => (s + 1) % (STEPS.length + 1)), 1700);
    return () => window.clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-amber/30 bg-amber/5 p-3.5">
      <div className="flex items-center justify-between">
        <CribaAi label="leyendo" />
        <span className="font-mono text-[11px] text-ink-3">andrea_gomez_cv.pdf</span>
      </div>
      <div className="flex gap-3.5">
        <div aria-hidden className="relative h-[92px] w-[70px] shrink-0 overflow-hidden rounded-[4px] border border-border bg-surface shadow-[0_6px_14px_-10px_rgba(0,0,0,0.4)]">
          <span className="mx-2 mt-2.5 block h-[4px] w-8 rounded-full bg-ink/60" />
          <span className="mx-2 mt-1.5 block h-[3px] w-10 rounded-full bg-ink/15" />
          <span className="mx-2 mt-3 block h-[3px] rounded-full bg-ink/15" />
          <span className="mx-2 mt-1.5 block h-[3px] w-9 rounded-full bg-ink/15" />
          <span className="mx-2 mt-1.5 block h-[3px] rounded-full bg-ink/15" />
          <span className="mx-2 mt-3 block h-[3px] w-7 rounded-full bg-ink/15" />
          <span className="mx-2 mt-1.5 block h-[3px] rounded-full bg-ink/15" />
          <span className="ai-scan" />
        </div>
        <ol className="flex min-w-0 flex-col gap-1.5">
          {STEPS.map((s, i) => {
            const done = i < step;
            const now = i === step;
            return (
              <li key={s} className={cn("flex items-start gap-2 text-[12.5px] leading-snug transition-colors duration-500", done ? "text-ink" : now ? "text-[color:var(--ai-ink)]" : "text-ink-3")}>
                <span className="mt-px flex size-4 shrink-0 items-center justify-center">
                  {done ? <Check aria-hidden className="size-3.5 text-success" /> : now ? <Loader2 aria-hidden className="size-3.5 animate-spin" /> : <span className="size-1.5 rounded-full bg-border-strong" />}
                </span>
                {s}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
