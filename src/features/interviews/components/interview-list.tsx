"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarClock, Radio } from "lucide-react";
import { Avatar, EmptyState, SearchField, Segmented } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { Interview } from "@/shared/types/domain";

type Filter = "all" | Interview["status"];

export const STATUS: Record<Interview["status"], { label: string; tone: string }> = {
  IN_PROGRESS: { label: "En curso", tone: "bg-blue-soft text-blue" },
  DONE: { label: "Terminada", tone: "bg-success-soft text-success" },
  SCHEDULED: { label: "Invitación enviada", tone: "bg-surface-2 text-ink-2" },
};

export const RECOMMENDATION = {
  ADVANCE: { label: "Recomienda avanzar", tone: "text-success" },
  REVIEW: { label: "Revisa los contrastes", tone: "text-warning" },
  DO_NOT_ADVANCE: { label: "No recomienda avanzar", tone: "text-danger" },
} as const;

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
export const when = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

/** Lista de entrevistas con IA: estado, avance, contrastes y recomendación. */
export function InterviewList({ interviews }: { interviews: Interview[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const count = (s: Interview["status"]) => interviews.filter((i) => i.status === s).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return interviews.filter((i) => (filter === "all" || i.status === filter) && `${i.candidate.name} ${i.jobTitle}`.toLowerCase().includes(q));
  }, [interviews, filter, query]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 animate-rise">
        <Segmented
          aria-label="Estado"
          value={filter}
          onChange={setFilter}
          items={[
            { value: "all", label: "Todas", count: interviews.length },
            { value: "IN_PROGRESS", label: "En curso", count: count("IN_PROGRESS") },
            { value: "DONE", label: "Terminadas", count: count("DONE") },
            { value: "SCHEDULED", label: "Por responder", count: count("SCHEDULED") },
          ]}
        />
        <SearchField placeholder="Buscar candidato o vacante" containerClassName="w-[280px]" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      {visible.length === 0 ? (
        <EmptyState title="Ninguna entrevista coincide" description="Cambia el filtro o invita a alguien desde el ranking." className="animate-rise" />
      ) : (
        <ul key={filter} className="card flex flex-col divide-y divide-border overflow-hidden">
          {visible.map((iv, i) => {
            const answered = iv.turns.filter((t) => t.answer).length;
            const conflicts = iv.contrasts.filter((c) => c.verdict === "conflict").length;
            const rec = iv.recommendation ? RECOMMENDATION[iv.recommendation] : null;
            return (
              <li key={iv.id} className="animate-[option-in_380ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 50}ms` }}>
                <Link href={routes.interview(iv.id)} className="group grid grid-cols-[44px_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_150px_24px] items-center gap-5 px-6 py-5 transition-colors duration-300 hover:bg-surface-2/60">
                  <Avatar name={iv.candidate.name} size={44} />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="truncate text-[15px] font-semibold">{iv.candidate.name}</span>
                    <span className="truncate text-[13px] text-ink-3">{iv.jobTitle}</span>
                  </span>
                  <span className="flex flex-col gap-1.5">
                    <span className="flex gap-[3px]" aria-label={`${answered} de ${iv.totalQuestions} preguntas respondidas`}>
                      {Array.from({ length: iv.totalQuestions }, (_, k) => {
                        const t = iv.turns[k];
                        return <span key={k} className={cn("h-1.5 flex-1 rounded-full", t?.verdict === "conflict" ? "bg-amber" : t?.answer ? "bg-success" : iv.status === "IN_PROGRESS" && k === answered ? "animate-breathe bg-ink" : "bg-surface-3")} />;
                      })}
                    </span>
                    <span className="text-[12.5px] text-ink-3">
                      {answered} de {iv.totalQuestions} preguntas{conflicts ? `, ${conflicts} ${conflicts === 1 ? "contraste" : "contrastes"}` : ""}
                    </span>
                  </span>
                  <span className={cn("text-[13.5px]", rec ? rec.tone : "text-ink-3")}>{rec ? rec.label : iv.status === "SCHEDULED" ? "Aún no responde" : "Esperando respuestas"}</span>
                  <span className="flex flex-col items-start gap-1">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium", STATUS[iv.status].tone)}>
                      {iv.status === "IN_PROGRESS" ? <Radio aria-hidden className="size-3 animate-breathe" /> : null}
                      {STATUS[iv.status].label}
                    </span>
                    <span className="flex items-center gap-1 text-[12px] text-ink-3">
                      <CalendarClock aria-hidden className="size-3" />
                      {iv.status === "SCHEDULED" ? `Hasta el ${when(iv.startedAt).split(",")[0]}` : when(iv.startedAt)}
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden className="size-4 text-ink-3 transition-[transform,color] duration-500 ease-[var(--ease-spring)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
