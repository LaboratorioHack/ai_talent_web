"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, CalendarPlus, Grid2x2, Quote } from "lucide-react";
import { Avatar, ButtonLink, EmptyState, Segmented, Select } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatShortDate } from "@/shared/lib/dates";
import type { RankingSummary, TopPerson } from "../types/ranking";

const TONE = { MEETS: "text-success", PARTIAL: "text-warning", DOES_NOT_MEET: "text-danger" } as const;

/** Una persona destacada de la vacante: puesto, puntaje y las citas que la ponen arriba. */
function PersonCard({ p, place, delay }: { p: TopPerson; place: number; delay: number }) {
  return (
    <article
      className="card group relative flex flex-col gap-4 p-5 transition-[transform,translate,scale,rotate,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(21,32,27,0.5)] animate-rise"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-3.5">
        <span className="relative">
          <Avatar name={p.name} size={52} />
          <span className={cn("absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full text-[11px] font-semibold ring-2 ring-surface", place === 1 ? "bg-amber text-ink" : "bg-ink text-ink-inverse")}>{place}</span>
        </span>
        <Link href={routes.ranking(p.jobId, p.id)} className="min-w-0 flex-1 truncate font-head text-[19px] leading-tight font-semibold tracking-[-0.01em] after:absolute after:inset-0">
          {p.name}
        </Link>
        <span className="flex flex-col items-end">
          <span className={cn("font-head text-[34px] leading-none font-semibold tracking-[-0.03em] tabular-nums", TONE[p.fulfillment])}>{p.score}</span>
          <span className="text-[11px] text-ink-3">de 100</span>
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {p.highlights.map((h) => (
          <li key={h.requirement} className="flex gap-2.5">
            <Quote aria-hidden className="mt-0.5 size-3.5 shrink-0 text-ink-3" />
            <span className="flex flex-col gap-0.5">
              <span className="text-[13px] leading-snug text-ink">{h.citation}</span>
              <span className="text-[11.5px] text-success">{h.requirement}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-auto flex items-center justify-between gap-3 border-t border-border pt-3.5">
        <span className="truncate text-[12px] text-ink-3">{p.missing.length ? `Validar: ${p.missing[0]}` : "Cumple todo lo pedido"}</span>
        <ButtonLink href={routes.ranking(p.jobId, p.id)} size="sm" variant="outline" icon={<CalendarPlus />}>
          Invitar
        </ButtonLink>
      </div>
    </article>
  );
}

/**
 * Portada de Ranking: cada vacante con sus mejores personas. La vacante
 * encabeza su grupo para que siempre se sepa de qué cargo se habla; las
 * personas, con su prueba, son el contenido.
 */
export function RankingIndex({ people, vacancies }: { people: TopPerson[]; vacancies: RankingSummary[] }) {
  const [job, setJob] = useState("all");
  const [only, setOnly] = useState<"meets" | "all">("all");

  const sections = useMemo(
    () =>
      vacancies
        .filter((v) => job === "all" || v.id === job)
        .map((v) => ({ v, list: people.filter((p) => p.jobId === v.id && (only === "all" || p.fulfillment === "MEETS")) })),
    [vacancies, people, job, only],
  );
  const options = [{ value: "all", label: "Todas las vacantes abiertas" }, ...vacancies.map((v) => ({ value: v.id, label: v.title, hint: `${v.evaluated} evaluadas` }))];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-center gap-3 animate-rise">
        <Select aria-label="Vacante" options={options} value={job} onChange={setJob} className="w-[300px]" />
        <Segmented aria-label="Quiénes" value={only} onChange={setOnly} items={[{ value: "all", label: "Todos" }, { value: "meets", label: "Solo los que cumplen" }]} />
      </div>

      <div key={`${job}-${only}`} className="flex flex-col gap-12">
        {sections.map(({ v, list }, si) => {
          const [a, b, c, ...rest] = list;
          const top = [a, b, c].filter(Boolean) as TopPerson[];
          return (
            <section key={v.id} className="flex flex-col gap-5">
              <header className="flex flex-wrap items-end justify-between gap-4 animate-rise" style={{ animationDelay: `${si * 80}ms` }}>
                <div className="flex items-center gap-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-ink-inverse">
                    <Briefcase aria-hidden className="size-5" />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <h2 className="font-head text-[24px] leading-tight font-semibold tracking-[-0.015em]">{v.title}</h2>
                    <p className="text-[13px] text-ink-3">
                      {v.evaluated ? `${v.evaluated} evaluadas, ${v.meets} cumplen el perfil` : "Sin evaluaciones todavía"}, cierra el {formatShortDate(new Date(`${v.closesAt}T12:00:00`))}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {v.evaluated ? (
                    <Link href={routes.tradeoffs(v.id)} className="group flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13.5px] font-medium text-ink ring-1 ring-border transition-[box-shadow,transform,translate] duration-300 hover:-translate-y-px hover:ring-border-strong hover:shadow-[0_10px_24px_-16px_rgba(0,0,0,0.45)]">
                      <Grid2x2 aria-hidden className="size-4" />
                      Ver matriz
                    </Link>
                  ) : null}
                  <Link href={routes.ranking(v.id)} className="group flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] text-ink-2 transition-colors duration-300 hover:text-ink">
                    Ranking completo
                    <ArrowRight aria-hidden className="size-4 transition-transform duration-500 ease-[var(--ease-spring)] group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </header>

              {top.length ? (
                <>
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                    {top.map((p, i) => (
                      <PersonCard key={p.id} p={p} place={i + 1} delay={si * 80 + 80 + i * 70} />
                    ))}
                  </div>
                  {rest.length ? (
                    <div className="flex flex-wrap items-center gap-2 animate-rise" style={{ animationDelay: `${si * 80 + 300}ms` }}>
                      <span className="mr-1 text-[12.5px] text-ink-3">Les siguen</span>
                      {rest.map((p, i) => (
                        <Link key={p.id} href={routes.ranking(p.jobId, p.id)} className="flex items-center gap-2 rounded-full bg-surface py-1 pr-3 pl-1 text-[13px] ring-1 ring-border transition-[box-shadow] hover:ring-border-strong">
                          <Avatar name={p.name} size={24} />
                          <span className="text-ink-3">{i + 4}</span>
                          {p.name}
                          <span className={cn("font-medium tabular-nums", TONE[p.fulfillment])}>{p.score}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  title={v.evaluated ? "Nadie cumple todavía" : "Todavía no hay candidatos"}
                  description={v.evaluated ? "Prueba con todos o ajusta el perfil de la vacante." : "Comparte el enlace de la vacante: aquí verás a las mejores personas que se postulen."}
                  action={v.evaluated ? undefined : <ButtonLink href={`${routes.candidates}?job=${v.id}`}>Compartir el enlace</ButtonLink>}
                  className="max-w-none animate-rise"
                />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
