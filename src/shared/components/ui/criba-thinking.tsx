"use client";

import { Check } from "lucide-react";
import { useTypewriter } from "@/shared/hooks/use-typewriter";
import { cn } from "@/shared/lib/cn";
import { CribaCharacter, type CribaMood } from "./criba-character";

export interface CribaThinkingProps {
  /** Lo que Criba va pensando, en orden. La última línea se escribe palabra por palabra. */
  thoughts: readonly string[];
  /** Sigue trabajando: el personaje se mueve y la última línea lleva cursor. */
  working: boolean;
  mood?: CribaMood;
  title?: string;
  className?: string;
}

/**
 * Criba AI pensando en voz alta: el personaje y la lista de lo que hace o
 * encontró. Las líneas viejas quedan como hechas; la última se va escribiendo.
 * Solo muestra pasos reales (lo que se está haciendo o lo que devolvió la IA).
 */
export function CribaThinking({ thoughts, working, mood = "thinking", title = "Criba AI está pensando", className }: CribaThinkingProps) {
  const last = thoughts.at(-1) ?? "";
  const { shown, done } = useTypewriter(last);
  return (
    <section
      aria-live="polite"
      aria-label={title}
      className={cn("flex gap-3.5 rounded-2xl bg-amber/8 px-4 py-3.5 ring-1 ring-amber/25 animate-rise", className)}
    >
      <CribaCharacter mood={working ? mood : "done"} size={30} className="mt-0.5" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="text-[11px] font-semibold tracking-[0.08em] text-[color:var(--ai-ink)] uppercase">{working ? title : "Criba AI terminó"}</p>
        <ol className="flex flex-col gap-1 text-[13.5px] leading-snug">
          {thoughts.slice(0, -1).map((t, i) => (
            <li key={`${i}-${t}`} className="flex items-start gap-2 text-ink-2">
              <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span className="min-w-0">{t}</span>
            </li>
          ))}
          {last ? (
            <li className="flex items-start gap-2 text-ink">
              <span aria-hidden className="mt-[7px] size-1.5 shrink-0 rounded-full bg-amber" />
              <span className={cn("min-w-0", working || !done ? "ai-caret" : null)}>{shown}</span>
            </li>
          ) : null}
        </ol>
      </div>
    </section>
  );
}
