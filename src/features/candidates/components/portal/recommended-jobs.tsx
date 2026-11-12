import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { CribaAi } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { PortalJob } from "../../types/portal";

export const MATCH_LABEL: Record<PortalJob["match"]["level"], { label: string; tone: string }> = {
  alta: { label: "Muy afín", tone: "bg-success-soft text-success" },
  media: { label: "Afín", tone: "bg-amber/15 text-[color:var(--ai-ink)]" },
  baja: { label: "Podría servirte", tone: "bg-surface-2 text-ink-2" },
};

export function matchReason(job: PortalJob): string {
  const r = job.match.reasons;
  if (!r.length) return "Es de un área cercana a la tuya.";
  const list = r.length === 1 ? r[0] : `${r.slice(0, -1).join(", ")} y ${r.at(-1)}`;
  return `Pide ${list}: está en tu hoja de vida.`;
}

/** Vacantes que Criba AI elige para la persona según su hoja de vida, con el porqué. */
export function RecommendedJobs({ jobs }: { jobs: PortalJob[] }) {
  const picks = jobs.filter((j) => !j.applied).slice(0, 3);
  if (!picks.length) return null;
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex flex-wrap items-center gap-2 text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">
          Vacantes para ti
          <CribaAi label="las eligió por tu hoja de vida" className="tracking-normal normal-case" />
        </h2>
        <Link href={routes.portalJobs} className="group inline-flex items-center gap-1 text-[13px] text-ink-2 hover:text-ink">
          Ver todas
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      <div className="flex items-center gap-3 text-[12.5px] text-ink-3">
        <span className="relative h-1 w-24 overflow-hidden rounded-full bg-border-strong">
          <span className="rail-fill absolute inset-0 rounded-full bg-amber [animation-duration:1600ms]" />
        </span>
        <span className="ai-caret">Comparó tu hoja de vida con {jobs.length} vacantes abiertas</span>
      </div>
      <ul className="panel flex flex-col divide-y divide-border overflow-hidden px-4">
        {picks.map((j, i) => {
          const m = MATCH_LABEL[j.match.level];
          return (
            <li key={j.id} className="animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <Link href={routes.apply(j.id)} className="group relative -mx-4 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 px-4 py-4">
                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(242_169_59/0.09),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="relative flex min-w-0 flex-col gap-1">
                  <span className="truncate text-[16px] font-semibold">{j.title}</span>
                  <span className="truncate text-[13px] text-ink-3">
                    {j.location}, {j.modality.toLowerCase()} · {matchReason(j)}
                  </span>
                </span>
                <span className={cn("relative rounded-full px-2.5 py-1 text-[12px] font-medium", m.tone)}>{m.label}</span>
                <ChevronRight aria-hidden className="relative size-4 text-ink-3 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
