"use client";

import { useEffect, useState } from "react";
import { EyeOff, FileSearch, ListOrdered, MessageSquareText, ScanText, type LucideIcon } from "lucide-react";
import { CribaAi } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

interface AiEvent {
  icon: LucideIcon;
  what: string;
  detail: string;
}

/** Lo que Criba AI hace con cada hoja de vida, en orden. Con backend: eventos reales de la ingesta y la evaluación. */
const EVENTS: AiEvent[] = [
  { icon: FileSearch, what: "Leyó hv_ingeniero_cloud.docx", detail: "Ingeniero Cloud Senior · 3 páginas" },
  { icon: EyeOff, what: "Quitó foto, fecha de nacimiento y dirección", detail: "Antes de evaluar, siempre" },
  { icon: ScanText, what: "Encontró «AKS en producción, 4 años»", detail: "Prueba el requisito Kubernetes · CV pág. 1" },
  { icon: ScanText, what: "Contó GCP como Azure al 80 %", detail: "Por la equivalencia que definiste" },
  { icon: ListOrdered, what: "Ubicó la hoja de vida en el puesto 6 de 85", detail: "Ingeniero Cloud Senior · cumple parcialmente" },
  { icon: MessageSquareText, what: "Detectó un contraste en la entrevista de Andrés", detail: "Dijo 32 servicios; la hoja de vida dice 45" },
  { icon: FileSearch, what: "Leyó una foto del celular con reconocimiento de texto", detail: "Analista de Datos · 1 página" },
  { icon: EyeOff, what: "Marcó un escaneo como ilegible", detail: "Pidió el original a la persona" },
];

const STEP_MS = 3200;
const SHOWN = 5;

/**
 * "Criba AI, ahora": lo último que hizo la IA, como un registro que se
 * escribe solo. Cada 3 s entra una acción nueva arriba y las demás bajan.
 */
export function AiActivity() {
  const [tick, setTick] = useState(SHOWN);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setTick((n) => n + 1), STEP_MS);
    return () => window.clearInterval(t);
  }, []);

  const items = Array.from({ length: SHOWN }, (_, i) => {
    const n = tick - i;
    return { key: n, ago: i, ...EVENTS[((n % EVENTS.length) + EVENTS.length) % EVENTS.length] };
  });

  return (
    <section className="card flex min-w-0 flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-head text-[19px] font-semibold tracking-[-0.01em]">
          <CribaAi />
          ahora
        </h2>
        <span className="flex items-center gap-1.5 text-[12.5px] text-success">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inset-0 rounded-full bg-success/50 animate-ping" />
            <span className="relative size-2 rounded-full bg-success" />
          </span>
          Trabajando
        </span>
      </header>
      <ol className="flex flex-col" aria-live="polite">
        {items.map((e, i) => (
          <li key={e.key} className={cn("flex gap-3 border-b border-border py-3 last:border-0", i === 0 && "animate-[option-in_420ms_var(--ease-out-soft)_both]")} style={{ opacity: 1 - i * 0.14 }}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", i === 0 ? "bg-amber/15 text-[color:var(--ai-ink)]" : "bg-surface-2 text-ink-3")}>
              <e.icon aria-hidden className="size-4" />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className={cn("text-[13.5px] leading-snug", i === 0 && "ai-caret font-medium")}>{e.what}</span>
              <span className="truncate text-[12px] text-ink-3">{e.detail}</span>
            </span>
            <span className="shrink-0 text-[11.5px] text-ink-3 tabular-nums">{i === 0 ? "ahora" : `hace ${i * 3} s`}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
