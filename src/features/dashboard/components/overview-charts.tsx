"use client";

import { useEffect, useState } from "react";
import { AnimatedNumber, CribaCharacter, Tooltip } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { PeriodStats } from "../api/dashboard";

/** El ancho real entra después de pintar, para que las barras y el anillo crezcan suave. */
function useGrow(): boolean {
  const [grown, setGrown] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setGrown(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return grown;
}

const FIT = [
  { key: "meets", label: "Cumplen", bar: "bg-success", dot: "bg-success" },
  { key: "partial", label: "Parcial", bar: "bg-warning", dot: "bg-warning" },
  { key: "doesNotMeet", label: "No cumplen", bar: "bg-danger", dot: "bg-danger" },
] as const;

/**
 * Cómo cumplen las hojas de vida evaluadas, en una barra: la proporción se lee
 * de un vistazo y cada tramo dice su cifra al pasar el puntero. Colores de
 * estado, siempre con su nombre al lado (nunca solo color).
 */
export function FitBreakdown({ stats, index = 0 }: { stats: PeriodStats; index?: number }) {
  const grown = useGrow();
  const evaluated = stats.meets + stats.partial + stats.doesNotMeet;
  const pct = (n: number) => (evaluated ? (n / evaluated) * 100 : 0);
  return (
    <section className="card flex flex-col gap-5 px-5 py-5 animate-rise sm:px-6" style={{ animationDelay: `${index * 70}ms` }} aria-labelledby="fit-title">
      <header className="flex items-baseline justify-between gap-3">
        <h2 id="fit-title" className="text-[13.5px] text-ink-2">
          Cómo cumplen las evaluadas
        </h2>
        <span className="text-[12.5px] text-ink-3 tabular-nums">{evaluated} evaluadas</span>
      </header>
      <p className="flex items-baseline gap-2">
        <AnimatedNumber value={stats.meets} className="font-head text-[34px] leading-none font-semibold tracking-[-0.02em] text-success tabular-nums" />
        <span className="text-[14px] text-ink-2">cumplen el perfil</span>
      </p>
      {evaluated ? (
        <div className="flex h-3.5 w-full gap-[2px]" role="img" aria-label={FIT.map((f) => `${f.label}: ${stats[f.key]}`).join(", ")}>
          {FIT.filter((f) => stats[f.key] > 0).map((f) => (
            <Tooltip key={f.key} content={`${f.label}: ${stats[f.key]} (${Math.round(pct(stats[f.key]))} %)`} className="h-full" style={{ width: grown ? `${pct(stats[f.key])}%` : "0%", transition: "width 900ms var(--ease-out-soft)" }}>
              <span className={cn("block h-full w-full rounded-[4px] transition-[filter] duration-300 hover:brightness-110", f.bar)} />
            </Tooltip>
          ))}
        </div>
      ) : (
        <div className="h-3.5 w-full rounded-[4px] bg-surface-2" aria-label="Sin evaluaciones en el período" role="img" />
      )}
      <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12.5px] text-ink-2">
        {FIT.map((f) => (
          <li key={f.key} className="flex items-center gap-1.5">
            <span aria-hidden className={cn("size-2 rounded-full", f.dot)} />
            {f.label} <span className="text-ink-3 tabular-nums">{stats[f.key]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Lo que leyó Criba AI: un anillo de leídas sobre recibidas y el tiempo que le
 * ahorró al equipo. El personaje acompaña: es trabajo de la IA.
 */
export function ReadingGauge({ stats, minutesPerResume, index = 0 }: { stats: PeriodStats; minutesPerResume: number; index?: number }) {
  const grown = useGrow();
  const share = stats.received ? stats.read / stats.received : 0;
  const r = 30;
  const c = 2 * Math.PI * r;
  const hours = Math.round((stats.read * minutesPerResume) / 60);
  const pending = stats.received - stats.read;
  return (
    <section className="card flex items-center gap-5 px-5 py-5 animate-rise sm:px-6" style={{ animationDelay: `${index * 70}ms` }} aria-labelledby="reading-title">
      <span className="relative flex size-[84px] shrink-0 items-center justify-center" role="img" aria-label={`Criba AI leyó ${stats.read} de ${stats.received} hojas de vida`}>
        <svg viewBox="0 0 72 72" className="absolute inset-0 -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="6" />
          <circle
            cx="36"
            cy="36"
            r={r}
            fill="none"
            stroke="var(--amber)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={grown ? c * (1 - share) : c}
            style={{ transition: "stroke-dashoffset 1100ms var(--ease-out-soft)" }}
          />
        </svg>
        <CribaCharacter size={30} mood={pending > 0 ? "reading" : "idle"} />
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 id="reading-title" className="text-[13.5px] text-ink-2">
          Lo que leyó Criba AI
        </h2>
        <p className="flex items-baseline gap-1.5">
          <AnimatedNumber value={stats.read} className="font-head text-[30px] leading-none font-semibold tracking-[-0.02em] tabular-nums" />
          <span className="text-[14px] text-ink-3">de {stats.received} hojas de vida</span>
        </p>
        <p className="text-[12.5px] text-ink-3">
          {/* El ahorro va en verde: es lo que la persona gana con Criba AI. */}
          {hours > 0 ? (
            <>
              <span className="font-semibold text-success">
                Unas {hours} {hours === 1 ? "hora" : "horas"} ahorradas
              </span>{" "}
              de lectura que tu equipo no tuvo que hacer
            </>
          ) : (
            "Aún no suma una hora de lectura ahorrada"
          )}
          {pending > 0 ? ` · ${pending} ${pending === 1 ? "falta" : "faltan"} por leer o piden el original` : ""}.
        </p>
      </div>
    </section>
  );
}
