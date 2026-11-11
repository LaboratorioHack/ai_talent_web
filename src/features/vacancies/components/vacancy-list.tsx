"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, ListOrdered, Pencil, Users } from "lucide-react";
import { ButtonLink, EmptyState, SearchField, Tabs, Tooltip } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatShortDate, fromISODate } from "@/shared/lib/dates";
import type { JobOpening, JobStatus } from "@/shared/types/domain";

type Filter = "all" | JobStatus;

const STATUS: Record<JobStatus, { label: string; tone: string }> = {
  OPEN: { label: "Abierta", tone: "bg-success-soft text-success" },
  DRAFT: { label: "Borrador", tone: "bg-surface-2 text-ink-2" },
  CLOSED: { label: "Cerrada", tone: "bg-surface-2 text-ink-3" },
};

const SEGMENTS = [
  { key: "meets", label: "Cumplen", color: "var(--success)" },
  { key: "partial", label: "Parcial", color: "var(--warning)" },
  { key: "doesNotMeet", label: "No cumplen", color: "var(--border-strong)" },
] as const;

/** Lista de vacantes con filtro por estado y búsqueda por nombre. */
export function VacancyList({ vacancies }: { vacancies: JobOpening[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");

  const count = (s: JobStatus) => vacancies.filter((v) => v.status === s).length;
  const visible = useMemo(
    () =>
      vacancies.filter((v) => (filter === "all" || v.status === filter) && v.title.toLowerCase().includes(query.trim().toLowerCase())),
    [vacancies, filter, query],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Tabs
          aria-label="Estado"
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "Todas", count: vacancies.length },
            { value: "OPEN", label: "Abiertas", count: count("OPEN") },
            { value: "DRAFT", label: "Borradores", count: count("DRAFT") },
            { value: "CLOSED", label: "Cerradas", count: count("CLOSED") },
          ]}
        />
        <SearchField placeholder="Buscar vacante" containerClassName="w-[280px]" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Ninguna vacante coincide" description="Cambia el filtro o crea una vacante nueva." action={<ButtonLink href={routes.newVacancy}>Nueva vacante</ButtonLink>} className="mx-auto w-[460px] animate-rise" />
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
          {visible.map((v, i) => {
            const s = v.stats;
            const closes = fromISODate(v.closesAt);
            const evaluated = s.meets + s.partial + s.doesNotMeet;
            return (
              <li key={v.id} className="card group flex flex-col gap-5 p-6 transition-[box-shadow,transform] duration-300 animate-rise hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(21,32,27,0.45)]" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Link href={routes.vacancy(v.id)} className="truncate font-head text-[19px] font-semibold transition-colors hover:text-blue">
                      {v.title}
                    </Link>
                    <span className="text-[12.5px] text-ink-3">
                      {v.profile.area}, {v.openings} {v.openings === 1 ? "plaza" : "plazas"}
                    </span>
                  </div>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium", STATUS[v.status].tone)}>{STATUS[v.status].label}</span>
                </div>

                <div className="flex flex-col gap-2">
                  {evaluated > 0 ? (
                    <span className="flex h-2.5 gap-[2px]">
                      {SEGMENTS.map((seg) =>
                        s[seg.key] > 0 ? (
                          <Tooltip key={seg.key} className="h-full" style={{ width: `${(s[seg.key] / evaluated) * 100}%`, minWidth: 6 }} content={`${seg.label}: ${s[seg.key]}`}>
                            <span tabIndex={0} aria-label={`${seg.label}: ${s[seg.key]}`} className="grow-x block h-full w-full rounded-[3px]" style={{ background: seg.color, animationDelay: `${200 + i * 60}ms` }} />
                          </Tooltip>
                        ) : null,
                      )}
                    </span>
                  ) : (
                    <span className="h-2.5 rounded-[3px] bg-surface-2" />
                  )}
                  <span className="text-[12px] text-ink-2">
                    {evaluated > 0 ? `${s.meets} cumplen, ${s.partial} parciales y ${s.doesNotMeet} no cumplen` : "Sin evaluaciones todavía"}
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-4 border-t border-border pt-4 text-[12.5px] text-ink-2">
                  <span className="flex items-center gap-1.5">
                    <Users aria-hidden className="size-3.5" />
                    {s.received} hojas de vida
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarClock aria-hidden className="size-3.5" />
                    {closes ? `Cierra el ${formatShortDate(closes)}` : "Sin cierre"}
                  </span>
                  <span className="ml-auto flex gap-1 opacity-70 transition-opacity duration-300 group-hover:opacity-100">
                    <Link href={routes.vacancyEdit(v.id)} aria-label={`Editar perfil de ${v.title}`} className="rounded-md p-1.5 transition-colors hover:bg-surface-2 hover:text-ink">
                      <Pencil aria-hidden className="size-4" />
                    </Link>
                    <Link href={routes.ranking(v.id)} aria-label={`Ranking de ${v.title}`} className="rounded-md p-1.5 transition-colors hover:bg-surface-2 hover:text-ink">
                      <ListOrdered aria-hidden className="size-4" />
                    </Link>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
