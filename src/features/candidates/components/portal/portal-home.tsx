import { ButtonLink } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { Applicant, PortalApplication, PortalJob, ResumeSummary } from "../../types/portal";
import { CvCard } from "./cv-card";
import { RecommendedJobs } from "./recommended-jobs";
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
export function PortalHome({ applicant, applications, resume, jobs }: { applicant: Applicant; applications: PortalApplication[]; resume: ResumeSummary | null; jobs: PortalJob[] }) {
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
            {applications.length
              ? `${advanced} ya ${advanced === 1 ? "pasó" : "pasaron"} la primera revisión${pending ? " y en uno te toca a ti" : ""}.`
              : "Cuando te postules a una vacante, la verás aquí con cada paso del proceso."}
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
          {open.length ? (
            <ul className="panel flex flex-col divide-y divide-border overflow-hidden px-4">
              {open.map((a, i) => (
                <ApplicationRow key={a.id} application={a} index={i} />
              ))}
            </ul>
          ) : (
            <div className="panel flex flex-col items-start gap-3 px-5 py-6 animate-rise">
              <p className="text-[15px] font-medium">{applications.length ? "No tienes procesos abiertos ahora" : "Todavía no tienes postulaciones"}</p>
              <p className="max-w-[520px] text-[13.5px] text-ink-2">
                Si te postulaste con otro correo, entra al portal con ese correo para verlas. Desde ahora, lo que envíes con tu sesión abierta aparece aquí aunque escribas otro correo.
              </p>
              <ButtonLink href={routes.portalJobs} size="sm" variant="outline">
                Ver vacantes abiertas
              </ButtonLink>
            </div>
          )}
          {ended.length ? (
            <>
              <div className="mt-10 mb-2 flex items-baseline justify-between">
                <h2 className="text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">Terminadas</h2>
                <span className="text-[12.5px] text-ink-3">{ended.length}</span>
              </div>
              <ul className="panel flex flex-col divide-y divide-border overflow-hidden px-4">
                {ended.map((a, i) => (
                  <ApplicationRow key={a.id} application={a} index={i} />
                ))}
              </ul>
            </>
          ) : null}
          <div className="mt-10">
            <RecommendedJobs jobs={jobs} />
          </div>
        </section>
      </div>

      <aside className="flex flex-col gap-10 lg:sticky lg:top-[96px] lg:self-start">
        <div className="animate-rise [animation-delay:140ms]">
          {resume ? (
            <CvCard resume={resume} />
          ) : (
            <section className="panel flex flex-col gap-2 p-5">
              <h2 className="text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">Tu hoja de vida</h2>
              <p className="text-[14px] text-ink-2">Se guarda aquí cuando te postulas a una vacante. Después puedes verla y editarla.</p>
            </section>
          )}
        </div>

        <section className="panel flex flex-col gap-4 p-5 animate-rise [animation-delay:200ms]">
          <h2 className="text-[13px] font-medium tracking-[0.08em] text-ink-3 uppercase">Últimos movimientos</h2>
          {moves.length ? null : <p className="text-[13.5px] text-ink-3">Aún no hay movimientos. Aquí verás cuando Criba lea tu hoja de vida o te inviten a la entrevista.</p>}
          <ol className="flex flex-col">
            {moves.map((m, i) => (
              <li key={m.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                {i < moves.length - 1 ? <span aria-hidden className="absolute top-3 left-[4px] h-full w-px bg-border-strong" /> : null}
                <span aria-hidden className={cn("relative mt-1.5 size-[9px] shrink-0 rounded-full ring-4 ring-surface", m.tone)} />
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
