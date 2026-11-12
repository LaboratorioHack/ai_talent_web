import Link from "next/link";
import { ArrowRight, CalendarClock, FileText, MessageSquareText, Search, ShieldCheck } from "lucide-react";
import { routes } from "@/shared/constants/routes";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { Applicant, PortalApplication, PortalJob, ResumeSummary } from "../../types/portal";
import { ApplicationCard } from "./application-card";
import { JobCard } from "./job-card";

/**
 * Inicio del portal del postulante: lo próximo que tiene que hacer, cómo van
 * sus procesos y vacantes que le pueden servir.
 */
export function PortalHome({ applicant, applications, jobs, resume }: { applicant: Applicant; applications: PortalApplication[]; jobs: PortalJob[]; resume: ResumeSummary }) {
  const first = applicant.name.split(" ")[0];
  const active = applications.filter((a) => a.outcome === "open");
  const pending = active.find((a) => a.interviewToken);
  const due = pending?.interviewDue ? fromISODate(pending.interviewDue) : null;
  const recommended = jobs.filter((j) => !j.applied).sort((a, b) => Number(b.area === applicant.interest) - Number(a.area === applicant.interest)).slice(0, 3);
  const counts = [
    { label: "En proceso", value: active.length },
    { label: "Entrevistas pendientes", value: active.filter((a) => a.interviewToken).length },
    { label: "Terminadas", value: applications.length - active.length },
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
      <section className="stagger grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_380px] [&>*]:animate-rise">
        <div className="flex flex-col justify-between gap-6 rounded-3xl border border-border bg-surface p-6 sm:p-8" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="flex flex-col gap-2">
            <p className="eyebrow">Tu portal</p>
            <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[38px]">Hola, {first}. Así van tus procesos.</h1>
            <p className="max-w-[560px] text-[15px] text-ink-2">Aquí ves en qué etapa está cada postulación y qué sigue. Nadie decide solo con la IA: siempre revisa una persona.</p>
          </div>
          <dl className="grid grid-cols-3 gap-3">
            {counts.map((c) => (
              <div key={c.label} className="flex flex-col gap-1 rounded-2xl bg-bg/60 px-4 py-3 ring-1 ring-border">
                <dd className="font-head text-[28px] leading-none font-semibold tabular-nums">{c.value}</dd>
                <dt className="text-[12.5px] text-ink-3">{c.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {pending ? (
          <div className="dark-scope relative flex flex-col justify-between gap-5 overflow-hidden rounded-3xl bg-bg p-6 text-ink sm:p-7" style={{ "--i": 1 } as React.CSSProperties}>
            <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.28),transparent)]" />
            <div className="relative flex flex-col gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-amber/15 text-amber">
                <MessageSquareText aria-hidden className="size-5" />
              </span>
              <p className="text-[12.5px] font-medium tracking-wide text-amber uppercase">Lo próximo</p>
              <h2 className="font-head text-[22px] leading-tight font-semibold">Responde la entrevista para {pending.jobTitle}</h2>
              <p className="flex items-center gap-1.5 text-[13.5px] text-ink-2">
                <CalendarClock aria-hidden className="size-4" />
                {due ? `Tienes hasta el ${formatLongDate(due)}` : "Sin fecha límite"} · unos 15 minutos, solo texto
              </p>
            </div>
            <Link href={routes.candidateInterview(pending.interviewToken!)} className="relative inline-flex h-11 items-center justify-center gap-2 rounded-full bg-amber px-5 text-[14px] font-semibold text-[#1a211d] transition-[filter] hover:brightness-105">
              Empezar ahora
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-surface p-6" style={{ "--i": 1 } as React.CSSProperties}>
            <p className="text-[12.5px] font-medium tracking-wide text-ink-3 uppercase">Lo próximo</p>
            <h2 className="font-head text-[21px] font-semibold">No tienes nada pendiente</h2>
            <Link href={routes.portalJobs} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-ink-inverse">
              <Search aria-hidden className="size-4" />
              Buscar vacantes
            </Link>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-head text-[22px] font-semibold tracking-[-0.01em]">Tus postulaciones activas</h2>
          <Link href={routes.portalApplications} className="text-[13.5px] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
            Ver todas ({applications.length})
          </Link>
        </div>
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {active.map((a, i) => (
            <ApplicationCard key={a.id} application={a} index={i} />
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <h2 className="font-head text-[22px] font-semibold tracking-[-0.01em]">Vacantes que te pueden servir</h2>
              <p className="text-[13px] text-ink-3">Según el área en la que más te postulas: {applicant.interest.toLowerCase()}.</p>
            </div>
            <Link href={routes.portalJobs} className="shrink-0 text-[13.5px] text-ink-2 underline-offset-4 hover:text-ink hover:underline">
              Ver todas
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 lg:grid-cols-2">
            {recommended.map((j, i) => (
              <JobCard key={j.id} job={j} index={i} />
            ))}
          </ul>
        </div>

        <aside className="flex flex-col gap-4 self-start rounded-3xl border border-border bg-surface p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
            <FileText aria-hidden className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="text-[16px] font-semibold">Tu hoja de vida</h2>
            <p className="truncate text-[13px] text-ink-3">{resume.fileName}</p>
          </div>
          <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-2">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
            Antes de evaluarla quitamos {resume.removed.length} datos personales. Mira exactamente qué recibe la IA.
          </p>
          <Link href={routes.portalProfile} className="inline-flex h-10 items-center justify-center rounded-full px-4 text-[13.5px] font-medium ring-1 ring-border transition-[box-shadow] hover:ring-border-strong">
            Ver mi perfil
          </Link>
        </aside>
      </section>
    </div>
  );
}
