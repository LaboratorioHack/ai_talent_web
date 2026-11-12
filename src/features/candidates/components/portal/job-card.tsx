import Link from "next/link";
import { ArrowRight, Check, MapPin } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { PortalJob } from "../../types/portal";

/** Vacante abierta en el portal: lo que se pide en tres líneas y hasta cuándo. */
export function JobCard({ job, index = 0 }: { job: PortalJob; index?: number }) {
  const closes = fromISODate(job.closesAt);
  return (
    <li className="animate-rise" style={{ animationDelay: `${index * 60}ms` }}>
      <Link
        href={routes.apply(job.id)}
        className="card group flex h-full flex-col gap-4 p-5 transition-[box-shadow,translate,border-color] duration-500 ease-[var(--ease-out-soft)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_18px_40px_-28px_rgba(21,32,27,0.45)]"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-[12.5px] text-ink-3">{job.company}</span>
          {job.applied ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] font-medium text-success">
              <Check aria-hidden className="size-3" />
              Ya te postulaste
            </span>
          ) : (
            <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] text-ink-2">{job.modality}</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="font-head text-[18px] leading-tight font-semibold tracking-[-0.01em]">{job.title}</h3>
          <p className="flex items-center gap-1 text-[13px] text-ink-3">
            <MapPin aria-hidden className="size-3.5" />
            {job.location} · {job.area}
          </p>
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {job.highlights.map((h) => (
            <li key={h} className="rounded-full border border-border px-2.5 py-1 text-[12px] text-ink-2">
              {h}
            </li>
          ))}
        </ul>
        <span className="mt-auto flex items-center justify-between border-t border-border pt-3.5 text-[13px]">
          <span className="text-ink-3">{closes ? `Hasta el ${formatLongDate(closes)}` : "Abierta"}</span>
          <span className="inline-flex items-center gap-1 font-medium text-ink transition-transform duration-300 group-hover:translate-x-0.5">
            {job.applied ? "Ver vacante" : "Ver y postularme"}
            <ArrowRight aria-hidden className="size-3.5" />
          </span>
        </span>
      </Link>
    </li>
  );
}
