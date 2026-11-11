"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarPlus, Quote } from "lucide-react";
import { AnimatedNumber, Avatar, ButtonLink, EmptyState, Segmented, Select } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { RankingSummary, TopPerson } from "../types/ranking";

const TONE = { MEETS: "text-success", PARTIAL: "text-warning", DOES_NOT_MEET: "text-danger" } as const;
const BAR = { MEETS: "bg-success", PARTIAL: "bg-amber", DOES_NOT_MEET: "bg-danger" } as const;

/** Una de las tres personas destacadas: grande, con las citas que la ponen arriba. */
function Spotlight({ p, place }: { p: TopPerson; place: number }) {
  return (
    <article
      className={cn(
        "card group relative flex flex-col gap-5 overflow-hidden p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_28px_56px_-32px_rgba(21,32,27,0.55)] animate-rise",
        place === 1 && "ring-1 ring-amber/50",
      )}
      style={{ animationDelay: `${place * 90}ms` }}
    >
      {place === 1 ? <span aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-56 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.22),transparent)]" /> : null}
      <div className="flex items-start gap-4">
        <span className="relative">
          <Avatar name={p.name} size={64} />
          <span className={cn("absolute -right-1 -bottom-1 flex size-6 items-center justify-center rounded-full text-[12px] font-semibold ring-2 ring-surface", place === 1 ? "bg-amber text-ink" : "bg-ink text-ink-inverse")}>{place}</span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link href={routes.ranking(p.jobId, p.id)} className="truncate font-head text-[22px] leading-tight font-semibold tracking-[-0.01em] after:absolute after:inset-0">
            {p.name}
          </Link>
          <span className="truncate text-[13px] text-ink-3">Para {p.jobTitle}</span>
        </div>
        <span className="flex flex-col items-end">
          <AnimatedNumber value={p.score} className={cn("font-head text-[44px] leading-none font-semibold tracking-[-0.03em] tabular-nums", TONE[p.fulfillment])} />
          <span className="text-[11.5px] text-ink-3">de 100</span>
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {p.highlights.map((h) => (
          <li key={h.requirement} className="flex gap-3">
            <Quote aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
            <span className="flex flex-col gap-0.5">
              <span className="text-[13.5px] leading-snug text-ink">{h.citation}</span>
              <span className="text-[12px] text-success">{h.requirement}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-[12.5px] text-ink-3">{p.missing.length ? `Falta validar: ${p.missing[0]}` : "Cumple todo lo pedido"}</span>
        <ButtonLink href={routes.ranking(p.jobId, p.id)} size="sm" variant={place === 1 ? "ink" : "outline"} icon={<CalendarPlus />}>
          Invitar
        </ButtonLink>
      </div>
    </article>
  );
}

/**
 * Portada de Ranking: primero las personas. Arriba las tres mejores de todas
 * tus vacantes con las citas que las respaldan; debajo, el resto en orden.
 */
export function RankingIndex({ people, vacancies }: { people: TopPerson[]; vacancies: RankingSummary[] }) {
  const [job, setJob] = useState("all");
  const [only, setOnly] = useState<"meets" | "all">("all");

  const visible = useMemo(() => people.filter((p) => (job === "all" || p.jobId === job) && (only === "all" || p.fulfillment === "MEETS")), [people, job, only]);
  const [first, second, third, ...rest] = visible;
  const podium = [first, second, third].filter(Boolean) as TopPerson[];

  const options = [{ value: "all", label: "Todas las vacantes abiertas" }, ...vacancies.map((v) => ({ value: v.id, label: v.title, hint: `${v.evaluated} evaluadas` }))];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
        <div className="flex items-center gap-3">
          <Select aria-label="Vacante" options={options} value={job} onChange={setJob} className="w-[300px]" />
          <Segmented aria-label="Quiénes" value={only} onChange={setOnly} items={[{ value: "all", label: "Todos" }, { value: "meets", label: "Solo los que cumplen" }]} />
        </div>
        {job !== "all" ? (
          <Link href={routes.ranking(job)} className="flex items-center gap-1 text-[13.5px] text-ink-2 transition-colors hover:text-ink">
            Abrir el ranking completo de la vacante
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        ) : (
          <span className="text-[13px] text-ink-3">{people.length} personas destacadas en {vacancies.filter((v) => v.evaluated).length} vacantes</span>
        )}
      </div>

      {podium.length === 0 ? (
        <EmptyState title="Nadie coincide con el filtro" description="Cambia la vacante o muestra a todos." className="animate-rise" />
      ) : (
        <div key={`${job}-${only}`} className="flex flex-col gap-8">
          <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
            {podium.map((p, i) => (
              <Spotlight key={p.id} p={p} place={i + 1} />
            ))}
          </section>

          {rest.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-head text-[19px] font-semibold tracking-[-0.01em]">Les siguen</h2>
              <ol className="card flex flex-col divide-y divide-border overflow-hidden">
                {rest.map((p, i) => (
                  <li key={p.id} className="animate-[option-in_360ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${Math.min(i, 12) * 35}ms` }}>
                    <Link href={routes.ranking(p.jobId, p.id)} className="group grid grid-cols-[32px_40px_minmax(0,1.2fr)_minmax(0,1.6fr)_120px_48px_20px] items-center gap-4 px-6 py-3.5 transition-colors duration-300 hover:bg-surface-2/60">
                      <span className="text-center font-mono text-[13px] text-ink-3">{i + 4}</span>
                      <Avatar name={p.name} size={40} />
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate text-[14.5px] font-medium">{p.name}</span>
                        <span className="truncate text-[12.5px] text-ink-3">{p.jobTitle}</span>
                      </span>
                      <span className="flex min-w-0 flex-wrap gap-1.5">
                        {p.met.slice(0, 3).map((m) => (
                          <span key={m} className="truncate rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] text-success">
                            {m}
                          </span>
                        ))}
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                        <span className={cn("grow-x block h-full rounded-full", BAR[p.fulfillment])} style={{ width: `${p.score}%` }} />
                      </span>
                      <span className={cn("text-right font-head text-[19px] font-semibold tabular-nums", TONE[p.fulfillment])}>{p.score}</span>
                      <ArrowUpRight aria-hidden className="size-4 text-ink-3 transition-[transform,color] duration-500 ease-[var(--ease-spring)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
