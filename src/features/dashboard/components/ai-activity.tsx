"use client";

import { useEffect, useState } from "react";
import { FileSearch, FileX, ListOrdered, MessageSquareText, type LucideIcon } from "lucide-react";
import { CribaAi } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { AiActivityItem } from "../api/dashboard";

const SHOWN = 5;
const STEP_MS = 4200;

const FULFILLMENT: Record<string, string> = {
  MEETS: "cumple el perfil",
  PARTIALLY_MEETS: "cumple parcialmente",
  DOES_NOT_MEET: "no cumple lo obligatorio",
};

function describe(e: AiActivityItem): { icon: LucideIcon; what: string; detail: string } {
  switch (e.kind) {
    case "read":
      return { icon: FileSearch, what: `Leyó ${e.fileName ?? "una hoja de vida"}`, detail: [e.jobTitle, e.pages ? `${e.pages} ${e.pages === 1 ? "página" : "páginas"}` : null].filter(Boolean).join(" · ") };
    case "unreadable":
      return { icon: FileX, what: `No pudo leer ${e.fileName ?? "una hoja de vida"}`, detail: `${e.jobTitle} · pide el original` };
    case "evaluated":
      return { icon: ListOrdered, what: e.position && e.of ? `Ubicó una hoja de vida en el puesto ${e.position} de ${e.of}` : "Evaluó una hoja de vida", detail: [e.jobTitle, e.fulfillment ? FULFILLMENT[e.fulfillment] : null].filter(Boolean).join(" · ") };
    default:
      return { icon: MessageSquareText, what: "Terminó una entrevista por chat", detail: e.jobTitle };
  }
}

/** "hace 5 min" desde el instante real del evento. */
function ago(iso: string, now: number): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} ${days === 1 ? "día" : "días"}`;
}

/**
 * "Criba AI, ahora": lo último que hizo la IA con las hojas de vida de la organización (lecturas,
 * evaluaciones y entrevistas reales). Si hay más de cinco eventos, la lista avanza sola mientras se ve.
 */
export function AiActivity({ events }: { events: AiActivityItem[] }) {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // La hora del navegador se lee después de hidratar, para que servidor y cliente coincidan.
    const first = window.requestAnimationFrame(() => setNow(Date.now()));
    if (events.length <= SHOWN || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return () => window.cancelAnimationFrame(first);
    const t = window.setInterval(() => {
      setOffset((o) => (o + 1) % events.length);
      setNow(Date.now());
    }, STEP_MS);
    return () => {
      window.cancelAnimationFrame(first);
      window.clearInterval(t);
    };
  }, [events.length]);

  const items = Array.from({ length: Math.min(SHOWN, events.length) }, (_, i) => events[(offset + i) % events.length]);
  const recent = events[0] && now !== null && now - new Date(events[0].at).getTime() < 15 * 60_000;

  return (
    <section className="card flex min-w-0 flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-head text-[19px] font-semibold tracking-[-0.01em]">
          <CribaAi />
          ahora
        </h2>
        <span className={cn("flex items-center gap-1.5 text-[12.5px]", recent ? "text-success" : "text-ink-3")}>
          <span aria-hidden className="relative flex size-2">
            {recent ? <span className="absolute inset-0 rounded-full bg-success/50 animate-ping" /> : null}
            <span className={cn("relative size-2 rounded-full", recent ? "bg-success" : "bg-ink-3")} />
          </span>
          {recent ? "Trabajando" : "En espera"}
        </span>
      </header>
      {items.length ? (
        <ol className="flex flex-col" aria-live="polite">
          {items.map((e, i) => {
            const d = describe(e);
            return (
              <li key={`${e.kind}-${e.at}-${(offset + i) % events.length}`} className={cn("flex gap-3 border-b border-border py-3 last:border-0", i === 0 && "animate-[option-in_420ms_var(--ease-out-soft)_both]")} style={{ opacity: 1 - i * 0.14 }}>
                <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", i === 0 ? "bg-amber/15 text-[color:var(--ai-ink)]" : "bg-surface-2 text-ink-3")}>
                  <d.icon aria-hidden className="size-4" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className={cn("text-[13.5px] leading-snug", i === 0 && "font-medium")}>{d.what}</span>
                  <span className="truncate text-[12px] text-ink-3">{d.detail}</span>
                </span>
                <span className="shrink-0 text-[11.5px] text-ink-3 tabular-nums">{now === null ? "" : ago(e.at, now)}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-[13.5px] text-ink-3">Cuando llegue la primera postulación, aquí verás lo que Criba AI lee y evalúa.</p>
      )}
    </section>
  );
}
