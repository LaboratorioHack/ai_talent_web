import Link from "next/link";
import { ArrowUpRight, MapPin, MessageSquareText } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { PortalApplication } from "../../types/portal";
import { outcomeLabel, StageTrack } from "./stage-track";

const day = (iso: string) => {
  const d = fromISODate(iso);
  return d ? formatLongDate(d) : iso;
};

/** Una postulación en el portal: cargo, etapa, qué sigue y la acción del momento. */
export function ApplicationCard({ application: a, index = 0 }: { application: PortalApplication; index?: number }) {
  const status = outcomeLabel(a);
  const muted = a.outcome === "closed" || a.outcome === "withdrawn";
  return (
    <li className="animate-rise" style={{ animationDelay: `${index * 70}ms` }}>
      <article className={cn("card group flex flex-col gap-5 p-5 transition-[box-shadow,translate] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(21,32,27,0.45)] sm:p-6", muted && "opacity-80")}>
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <Link href={routes.portalApplication(a.id)} className="font-head text-[19px] leading-tight font-semibold tracking-[-0.01em] underline-offset-4 hover:underline">
              {a.jobTitle}
            </Link>
            <p className="flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
              <span>{a.company}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden className="size-3.5" />
                {a.location}, {a.modality.toLowerCase()}
              </span>
            </p>
          </div>
          <span className={cn("shrink-0 rounded-full px-2.5 py-1 text-[12px] font-medium", status.tone)}>{status.label}</span>
        </header>

        <StageTrack application={a} />

        <p className="text-[13.5px] leading-relaxed text-ink-2">{a.note}</p>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <span className="text-[12.5px] text-ink-3">
            Te postulaste el {day(a.appliedAt)} · actualizada el {day(a.updatedAt)}
          </span>
          <span className="flex items-center gap-2">
            {a.interviewToken && a.outcome === "open" ? (
              <Link href={routes.candidateInterview(a.interviewToken)} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-medium text-ink-inverse transition-colors hover:bg-panel-2">
                <MessageSquareText aria-hidden className="size-4" />
                Responder entrevista
              </Link>
            ) : null}
            <Link href={routes.portalApplication(a.id)} className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px] text-ink-2 ring-1 ring-border transition-[color,box-shadow] hover:text-ink hover:ring-border-strong">
              Ver detalle
              <ArrowUpRight aria-hidden className="size-3.5" />
            </Link>
          </span>
        </footer>
      </article>
    </li>
  );
}
