import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";
import { Avatar, EmptyState, ScoreRing } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { formatShortDate } from "@/shared/lib/dates";
import type { RankingSummary } from "../types/ranking";

const SEG = [
  { key: "meets", label: "Cumplen", color: "var(--success)" },
  { key: "partial", label: "Parciales", color: "var(--amber)" },
  { key: "doesNotMeet", label: "No cumplen", color: "var(--surface-3)" },
] as const;

/** Portada de Ranking: cada vacante abierta con sus tres mejores perfiles. */
export function RankingIndex({ rankings }: { rankings: RankingSummary[] }) {
  if (!rankings.length) return <EmptyState title="Sin vacantes abiertas" description="Crea una vacante para ver su ranking." />;
  return (
    <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
      {rankings.map((r, i) => (
        <li key={r.id} className="animate-rise" style={{ animationDelay: `${i * 60}ms` }}>
          <Link href={routes.ranking(r.id)} className="card group flex h-full flex-col gap-5 p-6 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-1 hover:shadow-[0_24px_48px_-30px_rgba(21,32,27,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-head text-[20px] font-semibold tracking-[-0.01em]">{r.title}</span>
                <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
                  <CalendarClock aria-hidden className="size-3.5" />
                  Cierra el {formatShortDate(new Date(`${r.closesAt}T12:00:00`))}, {r.evaluated} evaluadas
                </span>
              </div>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-2 text-ink-2 transition-[transform,background-color,color] duration-500 ease-[var(--ease-spring)] group-hover:translate-x-1 group-hover:bg-ink group-hover:text-ink-inverse">
                <ArrowRight aria-hidden className="size-4" />
              </span>
            </div>

            {r.evaluated ? (
              <span className="flex h-2 gap-[2px]">
                {SEG.map((s) => (r[s.key] ? <span key={s.key} className="grow-x h-full rounded-[3px]" style={{ width: `${(r[s.key] / r.evaluated) * 100}%`, background: s.color, animationDelay: `${200 + i * 60}ms` }} /> : null))}
              </span>
            ) : null}

            {r.top.length ? (
              <ol className="flex flex-col gap-1">
                {r.top.map((c, k) => (
                  <li key={c.id} className="flex items-center gap-3 rounded-lg py-1.5">
                    <span className="w-4 text-center font-mono text-[12px] text-ink-3">{k + 1}</span>
                    <Avatar name={c.name} size={30} />
                    <span className="flex-1 truncate text-[14px]">{c.name}</span>
                    <ScoreRing score={c.score} size={36} />
                  </li>
                ))}
              </ol>
            ) : (
              <p className="rounded-xl border border-dashed border-border-strong px-4 py-6 text-center text-[13px] text-ink-3">Todavía no hay hojas de vida evaluadas</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
