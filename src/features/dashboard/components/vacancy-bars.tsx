import Link from "next/link";
import { Tooltip } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { formatShortDate, fromISODate } from "@/shared/lib/dates";
import type { DashboardData } from "../api/dashboard";

const SEGMENTS = [
  { key: "meets", label: "Cumplen", color: "var(--success)" },
  { key: "partial", label: "Parcial", color: "var(--warning)" },
  { key: "doesNotMeet", label: "No cumplen", color: "var(--border-strong)" },
] as const;

/**
 * Candidatos por vacante: barras apiladas con los colores de estado, siempre
 * con leyenda y cifra en texto (el ámbar no llega a 3:1 sobre blanco).
 * Separación de 2px entre segmentos y extremos redondeados.
 */
export function VacancyBars({ rows }: { rows: DashboardData["perVacancy"] }) {
  const max = Math.max(...rows.map((r) => r.received), 1);
  return (
    <figure className="flex flex-col gap-4" aria-label="Candidatos por vacante">
      <ul className="flex flex-col gap-3">
        {rows.map((r, i) => {
          const closes = fromISODate(r.closesAt);
          return (
            <li key={r.id} className="grid grid-cols-[180px_1fr_64px_52px] items-center gap-4 animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <Link href={routes.ranking(r.id)} className="truncate text-[13px] text-ink transition-colors hover:text-blue">
                {r.title}
              </Link>
              {r.received === 0 ? (
                <span className="text-[12px] text-ink-3">Sin hojas de vida todavía</span>
              ) : (
                <span className="flex h-3.5 gap-[2px]" style={{ width: `${(r.received / max) * 100}%` }}>
                  {SEGMENTS.map((seg) =>
                    r[seg.key] > 0 ? (
                      <Tooltip
                        key={seg.key}
                        className="h-full"
                        style={{ width: `${(r[seg.key] / r.received) * 100}%`, minWidth: 6 }}
                        content={`${seg.label}: ${r[seg.key]} de ${r.received}`}
                      >
                        <span
                          tabIndex={0}
                          aria-label={`${seg.label}: ${r[seg.key]}`}
                          className="grow-x block h-full w-full rounded-[3px] outline-offset-2"
                          style={{ background: seg.color, animationDelay: `${150 + i * 70}ms` }}
                        />
                      </Tooltip>
                    ) : null,
                  )}
                </span>
              )}
              <span className="text-right font-mono text-[12px] text-ink-2 tabular-nums">
                {r.meets} / {r.received}
              </span>
              <span className="text-right font-mono text-[11.5px] text-ink-3">{closes ? formatShortDate(closes) : ""}</span>
            </li>
          );
        })}
      </ul>
      <figcaption className="flex flex-wrap gap-4 text-[12px] text-ink-2">
        {SEGMENTS.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[2px]" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto text-ink-3">Cumplen de las recibidas y fecha de cierre</span>
      </figcaption>
    </figure>
  );
}
