import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ResumeSheet } from "@/shared/components/resume/resume-sheet";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { Applicant, PortalApplication, ResumeSummary } from "../../types/portal";
import { ApplicationRow } from "./application-row";
import { NextStep } from "./next-step";
import { STAGES } from "./stage-track";

const day = (iso: string) => {
  const d = fromISODate(iso);
  return d ? formatLongDate(d) : iso;
};

/** Últimos movimientos de todas las postulaciones, del más reciente al más viejo. */
function activity(applications: PortalApplication[]) {
  const text: Record<string, string> = {
    received: "Recibieron tu hoja de vida",
    review: "Pasó a revisión",
    interview: "Te invitaron a la entrevista",
    decision: "Cerraron el proceso",
  };
  return applications
    .flatMap((a) => a.history.map((h) => ({ id: `${a.id}-${h.stage}`, at: h.at, title: a.jobTitle, text: a.outcome === "closed" && h.stage === "decision" ? "Siguieron con otras personas" : text[h.stage], tone: h.stage === "interview" ? "bg-amber" : h.stage === "decision" ? "bg-ink-3" : "bg-success" })))
    .sort((x, y) => y.at.localeCompare(x.at))
    .slice(0, 4);
}

/**
 * Inicio del portal. Profundidad con luz y movimiento: titular con resaltador,
 * lo próximo en un bloque ámbar vivo, postulaciones como filas con riel de
 * etapas y, al lado, la hoja de vida en una pila de papeles y lo último que pasó.
 */
export function PortalHome({ applicant, applications, resume, newJobs }: { applicant: Applicant; applications: PortalApplication[]; resume: ResumeSummary; newJobs: number }) {
  const first = applicant.name.split(" ")[0];
  const open = applications.filter((a) => a.outcome === "open");
  const ended = applications.filter((a) => a.outcome !== "open");
  const pending = open.find((a) => a.interviewToken);
  const moves = activity(applications);
  const advanced = open.filter((a) => STAGES.findIndex((s) => s.key === a.stage) >= 1).length;

  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-16 lg:px-8 lg:pt-14">
      <div className="flex min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-3 animate-rise">
          <p className="text-[14px] text-ink-3">Hola, {first}</p>
          <h1 className="font-head text-[38px] leading-[1.02] font-semibold tracking-[-0.025em] text-balance sm:text-[52px]">
            Tienes <span className="hl">{open.length} procesos</span> en curso
          </h1>
          <p className="text-[15px] text-ink-2">
            {advanced} ya {advanced === 1 ? "pasó" : "pasaron"} la primera revisión{pending ? " y en uno te toca a ti" : ""}.
          </p>
        </header>

        {pending ? (
          <div className="animate-rise [animation-delay:80ms]">
            <NextStep application={pending} />
          </div>
        ) : null}

        <section className="flex flex-col">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">En curso</h2>
            <span className="text-[12.5px] text-ink-3">{open.length}</span>
          </div>
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {open.map((a, i) => (
              <ApplicationRow key={a.id} application={a} index={i} />
            ))}
          </ul>
          {ended.length ? (
            <>
              <div className="mt-10 mb-2 flex items-baseline justify-between">
                <h2 className="text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">Terminadas</h2>
                <span className="text-[12.5px] text-ink-3">{ended.length}</span>
              </div>
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {ended.map((a, i) => (
                  <ApplicationRow key={a.id} application={a} index={i} />
                ))}
              </ul>
            </>
          ) : null}
          <Link href={routes.portalJobs} className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full py-2 pr-4 pl-1 text-[14px] text-ink-2 transition-colors hover:text-ink">
            <span className="flex size-8 items-center justify-center rounded-full bg-surface-2 font-head text-[13px] font-semibold text-amber ring-1 ring-border">{newJobs}</span>
            vacantes abiertas que todavía no has visto
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </section>
      </div>

      <aside className="flex flex-col gap-10 lg:sticky lg:top-[96px] lg:self-start">
        <section className="flex flex-col gap-4 animate-rise [animation-delay:140ms]">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">Tu hoja de vida</h2>
            <span className="text-[12.5px] text-ink-3">{day(resume.updatedAt)}</span>
          </div>
          <Link href={routes.portalResume} aria-label="Ver y editar tu hoja de vida" className="group relative block h-[330px]">
            <span aria-hidden className="absolute inset-x-6 top-3 h-[300px] rounded-[3px] bg-[#e9e3d6] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-[var(--ease-spring)] [rotate:-4deg] group-hover:[rotate:-9deg] group-hover:-translate-x-3" />
            <span aria-hidden className="absolute inset-x-4 top-1.5 h-[310px] rounded-[3px] bg-[#efe9dc] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.8)] transition-transform duration-700 ease-[var(--ease-spring)] [rotate:3deg] group-hover:[rotate:7deg] group-hover:translate-x-3" />
            <span className="absolute inset-x-0 top-0 h-[320px] overflow-hidden rounded-[3px] transition-transform duration-700 ease-[var(--ease-spring)] animate-[float_7s_ease-in-out_infinite] group-hover:-translate-y-1">
              <span className="pointer-events-none block origin-top-left scale-[0.6]" style={{ width: "166.7%" }}>
                <ResumeSheet doc={resume.doc} compact />
              </span>
              <span className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f5f1e8] to-transparent" />
              <span className="absolute inset-x-0 bottom-4 flex justify-center">
                <span className="rounded-full bg-[#1a211d] px-4 py-2 text-[13px] font-medium text-[#f5f1e8] transition-transform duration-300 group-hover:-translate-y-0.5">Ver y editar</span>
              </span>
            </span>
          </Link>
        </section>

        <section className="flex flex-col gap-4 animate-rise [animation-delay:200ms]">
          <h2 className="text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">Últimos movimientos</h2>
          <ol className="flex flex-col">
            {moves.map((m, i) => (
              <li key={m.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < moves.length - 1 ? <span aria-hidden className="absolute top-3 left-[4px] h-full w-px bg-border-strong" /> : null}
                <span aria-hidden className={cn("relative mt-1.5 size-[9px] shrink-0 rounded-full ring-4 ring-bg", m.tone)} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13.5px] text-ink">{m.text}</span>
                  <span className="truncate text-[12.5px] text-ink-3">
                    {m.title} · {day(m.at)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}
