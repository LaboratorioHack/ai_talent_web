"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ListOrdered, Pencil, Upload } from "lucide-react";
import { ButtonLink, EmptyState, SearchField, Segmented, Select, Tooltip } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { useToday } from "@/shared/hooks/use-today";
import { cn } from "@/shared/lib/cn";
import { formatShortDate, fromISODate } from "@/shared/lib/dates";
import type { JobOpening, JobStatus } from "@/shared/types/domain";

type Filter = "all" | JobStatus;
type Sort = "closing" | "received" | "name";

const STATUS: Record<JobStatus, { label: string; dot: string }> = {
  OPEN: { label: "Abierta", dot: "bg-success" },
  DRAFT: { label: "Borrador", dot: "bg-amber" },
  CLOSED: { label: "Cerrada", dot: "bg-ink-3" },
};

const SEGMENTS = [
  { key: "meets", label: "Cumplen", color: "var(--success)" },
  { key: "partial", label: "Parciales", color: "var(--amber)" },
  { key: "doesNotMeet", label: "No cumplen", color: "var(--surface-3)" },
] as const;

const SORTS = [
  { value: "closing", label: "Cierre más cercano" },
  { value: "received", label: "Más hojas de vida" },
  { value: "name", label: "Nombre" },
];

const DAY = 86_400_000;

function Stat({ value, label, tone }: { value: number; label: string; tone?: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span className={cn("font-head text-[26px] leading-none font-semibold tracking-[-0.02em] tabular-nums", tone)}>{value}</span>
      <span className="text-[12px] text-ink-3">{label}</span>
    </span>
  );
}

function VacancyCard({ v, index, today }: { v: JobOpening; index: number; today: Date | null }) {
  const s = v.stats;
  const evaluated = s.meets + s.partial + s.doesNotMeet;
  const closes = fromISODate(v.closesAt);
  const created = fromISODate(v.createdAt);
  const daysLeft = closes && today ? Math.ceil((closes.getTime() - today.getTime()) / DAY) : null;
  const elapsed = closes && created && today ? Math.min(1, Math.max(0, (today.getTime() - created.getTime()) / (closes.getTime() - created.getTime()))) : 0;
  const draft = v.status === "DRAFT";
  const action = "flex size-9 items-center justify-center rounded-full text-ink-3 transition-[background-color,color] duration-300 hover:bg-surface-2 hover:text-ink";

  return (
    <li className="animate-rise" style={{ animationDelay: `${index * 55}ms` }}>
      <article className="card group relative flex h-full flex-col gap-6 p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(21,32,27,0.5)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="flex items-center gap-2 text-[12.5px] text-ink-3">
              <span className={cn("size-2 rounded-full", STATUS[v.status].dot)} />
              {STATUS[v.status].label}
              <span aria-hidden className="h-3 w-px bg-border-strong" />
              {v.profile.area}, {v.openings} {v.openings === 1 ? "plaza" : "plazas"}
            </span>
            <Link href={draft ? routes.vacancyEdit(v.id) : routes.vacancy(v.id)} className="truncate font-head text-[21px] leading-tight font-semibold tracking-[-0.01em] after:absolute after:inset-0 after:rounded-2xl">
              {v.title}
            </Link>
          </div>
          <span className="relative z-10 -mt-1 -mr-2 flex shrink-0 gap-0.5 opacity-60 transition-opacity duration-300 group-hover:opacity-100">
            <Tooltip content="Editar perfil">
              <Link href={routes.vacancyEdit(v.id)} aria-label={`Editar perfil de ${v.title}`} className={action}>
                <Pencil aria-hidden className="size-4" />
              </Link>
            </Tooltip>
            <Tooltip content="Ver ranking">
              <Link href={routes.ranking(v.id)} aria-label={`Ranking de ${v.title}`} className={action}>
                <ListOrdered aria-hidden className="size-4" />
              </Link>
            </Tooltip>
            <Tooltip content="Subir hojas de vida">
              <Link href={`${routes.candidates}?job=${v.id}`} aria-label={`Subir hojas de vida a ${v.title}`} className={action}>
                <Upload aria-hidden className="size-4" />
              </Link>
            </Tooltip>
          </span>
        </div>

        {draft ? (
          <p className="rounded-xl bg-surface-2 px-4 py-3.5 text-[13.5px] text-ink-2">Termina el perfil de cargo para empezar a recibir y evaluar hojas de vida.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4">
              <Stat value={s.received} label="hojas de vida" />
              <Stat value={s.meets} label="cumplen" tone={s.meets ? "text-success" : "text-ink-3"} />
              <Stat value={s.interview} label="en entrevista" tone={s.interview ? "text-ink" : "text-ink-3"} />
            </div>
            {evaluated ? (
              <span className="flex h-1.5 gap-[2px]" role="img" aria-label={`${s.meets} cumplen, ${s.partial} parciales y ${s.doesNotMeet} no cumplen`}>
                {SEGMENTS.map((seg) => (s[seg.key] ? <span key={seg.key} className="grow-x h-full rounded-full" style={{ width: `${(s[seg.key] / evaluated) * 100}%`, background: seg.color, animationDelay: `${200 + index * 55}ms` }} /> : null))}
              </span>
            ) : (
              <span className="h-1.5 rounded-full bg-surface-2" />
            )}
          </>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-border pt-4 text-[13px]">
          {closes ? (
            <>
              <span className="h-1 w-16 overflow-hidden rounded-full bg-surface-2" aria-hidden>
                <span className={cn("grow-x block h-full rounded-full", daysLeft !== null && daysLeft <= 7 ? "bg-warning" : "bg-ink-3")} style={{ width: `${elapsed * 100}%` }} />
              </span>
              <span className={cn(daysLeft !== null && daysLeft <= 7 ? "text-warning" : "text-ink-2")}>
                {daysLeft === null ? `Cierra el ${formatShortDate(closes)}` : daysLeft < 0 ? "Cerrada" : daysLeft === 0 ? "Cierra hoy" : `Cierra en ${daysLeft} ${daysLeft === 1 ? "día" : "días"}`}
              </span>
            </>
          ) : (
            <span className="text-ink-3">Sin fecha de cierre</span>
          )}
          <span className="ml-auto flex items-center gap-1 text-ink-3 transition-[color,transform] duration-500 ease-[var(--ease-spring)] group-hover:translate-x-0.5 group-hover:text-ink">
            {draft ? "Terminar perfil" : "Abrir pipeline"}
            <ArrowUpRight aria-hidden className="size-4" />
          </span>
        </div>
      </article>
    </li>
  );
}

/** Lista de vacantes con filtro por estado, orden y búsqueda. Al filtrar, las tarjetas entran escalonadas. */
export function VacancyList({ vacancies }: { vacancies: JobOpening[] }) {
  const today = useToday();
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("closing");
  const [query, setQuery] = useState("");

  const count = (s: JobStatus) => vacancies.filter((v) => v.status === s).length;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = vacancies.filter((v) => (filter === "all" || v.status === filter) && v.title.toLowerCase().includes(q));
    return [...list].sort((a, b) => (sort === "name" ? a.title.localeCompare(b.title) : sort === "received" ? b.stats.received - a.stats.received : a.closesAt.localeCompare(b.closesAt)));
  }, [vacancies, filter, query, sort]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
        <Segmented
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
        <div className="flex items-center gap-2">
          <Select aria-label="Ordenar" options={SORTS} value={sort} onChange={(v) => setSort(v as Sort)} className="w-[210px]" triggerClassName="field-box h-10 w-full px-3.5 text-[13.5px] text-ink" />
          <SearchField placeholder="Buscar vacante" containerClassName="w-[260px]" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {visible.length === 0 ? (
        <EmptyState key={`empty-${filter}`} title="Ninguna vacante coincide" description="Cambia el filtro o crea una vacante nueva." action={<ButtonLink href={routes.newVacancy}>Nueva vacante</ButtonLink>} className="animate-rise" />
      ) : (
        <ul key={`${filter}-${sort}`} className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {visible.map((v, i) => (
            <VacancyCard key={v.id} v={v} index={i} today={today} />
          ))}
        </ul>
      )}
    </div>
  );
}
