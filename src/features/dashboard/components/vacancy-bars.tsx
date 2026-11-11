"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatShortDate, fromISODate } from "@/shared/lib/dates";

export interface VacancyBarRow {
  id: string;
  title: string;
  closesAt: string;
  received: number;
  meets: number;
  partial: number;
  doesNotMeet: number;
}

const SEGMENTS = [
  { key: "meets", label: "Cumplen", color: "var(--success)", text: "text-ink-inverse" },
  { key: "partial", label: "Parciales", color: "var(--amber)", text: "text-ink" },
  { key: "doesNotMeet", label: "No cumplen", color: "var(--surface-3)", text: "text-ink-2" },
] as const;

/**
 * Candidatos por vacante: barras apiladas con los colores de estado, la cifra
 * centrada dentro de cada tramo cuando cabe y leyenda siempre visible. Al pasar
 * el ratón por un tramo, el globo dice cuántos y qué porcentaje son.
 */
export function VacancyBars({ rows }: { rows: VacancyBarRow[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(...rows.map((r) => r.received), 1);

  return (
    <figure className="flex flex-col gap-5" aria-label="Candidatos por vacante">
      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-2">
        {SEGMENTS.map((s) => (
          <span key={s.key} className="flex items-center gap-2">
            <span className="size-3 rounded-[3px] ring-1 ring-border/60" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto text-[12px] text-ink-3">Recibidas y fecha de cierre a la derecha</span>
      </figcaption>

      <ul className="flex flex-col gap-3.5">
        {rows.map((r, i) => {
          const closes = fromISODate(r.closesAt);
          const evaluated = r.meets + r.partial + r.doesNotMeet;
          return (
            <li key={r.id} className="grid grid-cols-[190px_1fr_110px] items-center gap-5 animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
              <Link href={routes.ranking(r.id)} className="truncate text-[13.5px] font-medium text-ink transition-colors hover:text-blue">
                {r.title}
              </Link>
              {evaluated === 0 ? (
                <span className="flex h-7 items-center rounded-md border border-dashed border-border-strong px-3 text-[12px] text-ink-3">Sin hojas de vida en este período</span>
              ) : (
                <span className="flex h-7 gap-[2px]" style={{ width: `${Math.max(18, (r.received / max) * 100)}%` }}>
                  {SEGMENTS.map((seg) => {
                    const n = r[seg.key];
                    if (!n) return null;
                    const share = n / evaluated;
                    const id = `${r.id}-${seg.key}`;
                    return (
                      <span
                        key={`${seg.key}-${n}`}
                        tabIndex={0}
                        role="img"
                        aria-label={`${r.title}, ${seg.label}: ${n} de ${evaluated}`}
                        onPointerEnter={() => setHover(id)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover(id)}
                        onBlur={() => setHover(null)}
                        className={cn(
                          "grow-x relative flex h-full items-center justify-center rounded-[4px] font-mono text-[11.5px] font-medium transition-[filter,opacity] duration-300 outline-offset-2",
                          seg.text,
                          hover && hover !== id && hover.startsWith(r.id) && "opacity-55",
                          hover === id && "brightness-95",
                        )}
                        style={{ width: `${share * 100}%`, minWidth: 8, background: seg.color, animationDelay: `${150 + i * 60}ms` }}
                      >
                        {share >= 0.12 ? n : null}
                        {hover === id ? (
                          <span role="tooltip" className="absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-max -translate-x-1/2 rounded-lg bg-panel px-3 py-2 text-left font-sans text-[12px] leading-snug font-normal text-ink-inverse shadow-[0_12px_30px_-12px_rgba(21,32,27,0.6)] animate-[fade-in_160ms_ease-out]">
                            <strong className="block font-semibold">
                              {n} {seg.label.toLowerCase()}
                            </strong>
                            <span className="opacity-75">
                              {Math.round(share * 100)} % de las {evaluated} evaluadas
                            </span>
                          </span>
                        ) : null}
                      </span>
                    );
                  })}
                </span>
              )}
              <span className="flex flex-col items-end text-right">
                <span className="text-[13px] font-medium text-ink tabular-nums">{r.received} recibidas</span>
                <span className="text-[11.5px] text-ink-3">{closes ? `Cierra el ${formatShortDate(closes)}` : ""}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}
