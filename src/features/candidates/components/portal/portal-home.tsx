import Link from "next/link";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { ResumeSheet } from "@/shared/components/resume/resume-sheet";
import { routes } from "@/shared/constants/routes";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { Applicant, PortalApplication, ResumeSummary } from "../../types/portal";
import { ApplicationRow } from "./application-row";

/**
 * Inicio del portal: lo que toca hacer, las postulaciones como lista y, al
 * lado, la hoja de vida a la vista. Sin tarjetas de adorno.
 */
export function PortalHome({ applicant, applications, resume, newJobs }: { applicant: Applicant; applications: PortalApplication[]; resume: ResumeSummary; newJobs: number }) {
  const first = applicant.name.split(" ")[0];
  const open = applications.filter((a) => a.outcome === "open");
  const ended = applications.filter((a) => a.outcome !== "open");
  const pending = open.find((a) => a.interviewToken);
  const due = pending?.interviewDue ? fromISODate(pending.interviewDue) : null;
  const updated = fromISODate(resume.updatedAt);

  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-16 lg:px-8 lg:pt-14">
      <div className="flex min-w-0 flex-col gap-10">
        <header className="flex flex-col gap-2 animate-rise">
          <p className="text-[14px] text-ink-3">Hola, {first}</p>
          <h1 className="font-head text-[34px] leading-[1.05] font-semibold tracking-[-0.02em] sm:text-[44px]">
            {open.length === 1 ? "Tienes 1 proceso en curso" : `Tienes ${open.length} procesos en curso`}
          </h1>
        </header>

        {pending ? (
          <Link
            href={routes.candidateInterview(pending.interviewToken!)}
            className="group flex items-center gap-4 rounded-2xl bg-amber px-5 py-4 text-[#1a211d] transition-[filter] duration-300 hover:brightness-105 animate-rise [animation-delay:60ms] sm:px-6"
          >
            <MessageSquareText aria-hidden className="size-5 shrink-0" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[15px] font-semibold">Responde la entrevista de {pending.jobTitle}</span>
              <span className="text-[13px] opacity-75">{due ? `Hasta el ${formatLongDate(due)}` : "Sin fecha límite"} · unos 15 minutos por chat</span>
            </span>
            <span className="hidden items-center gap-1.5 text-[14px] font-semibold sm:flex">
              Empezar
              <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </Link>
        ) : null}

        <section className="flex flex-col">
          <ul className="flex flex-col divide-y divide-border border-y border-border">
            {open.map((a, i) => (
              <ApplicationRow key={a.id} application={a} index={i} />
            ))}
          </ul>
          {ended.length ? (
            <>
              <h2 className="mt-10 mb-1 text-[13px] text-ink-3">Terminadas</h2>
              <ul className="flex flex-col divide-y divide-border border-y border-border">
                {ended.map((a, i) => (
                  <ApplicationRow key={a.id} application={a} index={i} />
                ))}
              </ul>
            </>
          ) : null}
          <Link href={routes.portalJobs} className="group mt-8 inline-flex w-fit items-center gap-1.5 text-[14px] text-ink-2 transition-colors hover:text-ink">
            {newJobs} vacantes abiertas que todavía no has visto
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
        </section>
      </div>

      <aside className="flex flex-col gap-4 animate-rise [animation-delay:120ms] lg:sticky lg:top-[96px] lg:self-start">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[14px] font-medium">Tu hoja de vida</h2>
          <span className="text-[12.5px] text-ink-3">{updated ? `Actualizada el ${formatLongDate(updated)}` : ""}</span>
        </div>
        <Link href={routes.portalResume} aria-label="Ver y editar tu hoja de vida" className="group relative block h-[380px] overflow-hidden rounded-[3px]">
          <div className="pointer-events-none origin-top-left scale-[0.62] transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[0.63]" style={{ width: "161%" }}>
            <ResumeSheet doc={resume.doc} compact />
          </div>
          <span className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-bg to-transparent" />
          <span className="absolute inset-x-0 bottom-3 flex justify-center">
            <span className="rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-bg transition-transform duration-300 group-hover:-translate-y-0.5">Ver y editar</span>
          </span>
        </Link>
        <p className="text-[12.5px] text-ink-3">Es la que reciben las empresas cuando te postulas.</p>
      </aside>
    </div>
  );
}
