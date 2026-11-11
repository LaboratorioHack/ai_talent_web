import { Briefcase, CalendarClock, Check, Users } from "lucide-react";
import { formatDateDisplay, fromISODate } from "@/shared/lib/dates";
import type { PublicJob } from "../types/public";
import { ApplyForm } from "./apply-form";

/**
 * Pantalla 16 · Vacante pública + postulación (candidato). A la izquierda el
 * cargo en lenguaje claro; a la derecha el formulario, fijo al bajar.
 * No se muestran pesos, puntajes ni requisitos descalificantes.
 */
export function PublicJobView({ job }: { job: PublicJob }) {
  const closes = fromISODate(job.closesAt);
  const facts = [
    { icon: Briefcase, text: job.area },
    { icon: Users, text: `${job.openings} ${job.openings === 1 ? "plaza" : "plazas"}` },
    { icon: CalendarClock, text: closes ? `Recibe postulaciones hasta el ${formatDateDisplay(closes)}` : "Postulaciones abiertas" },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-8 px-4 pt-8 pb-16 sm:px-6 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14 lg:px-8">
      <article className="stagger flex min-w-0 flex-col gap-8 [&>*]:animate-rise">
        <header className="flex flex-col gap-4" style={{ "--i": 0 } as React.CSSProperties}>
          <p className="eyebrow">{job.company}</p>
          <h1 className="font-head text-[32px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance sm:text-[42px]">{job.title}</h1>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-ink-2">
            {facts.map((f) => (
              <li key={f.text} className="flex items-center gap-2">
                <f.icon aria-hidden className="size-4 text-ink-3" />
                {f.text}
              </li>
            ))}
          </ul>
        </header>

        {job.description ? (
          <section className="flex flex-col gap-3" style={{ "--i": 1 } as React.CSSProperties}>
            <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">El cargo</h2>
            <p className="max-w-[640px] text-[15.5px] leading-relaxed text-ink-2">{job.description}</p>
          </section>
        ) : null}

        <section className="flex flex-col gap-4" style={{ "--i": 2 } as React.CSSProperties}>
          <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">Lo que buscamos</h2>
          <ul className="flex flex-col gap-2.5">
            {job.mandatory.map((r) => (
              <li key={r} className="flex items-start gap-3 text-[15px]">
                <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                  <Check className="size-3" />
                </span>
                {r}
              </li>
            ))}
          </ul>
          {job.desirable.length ? (
            <>
              <h3 className="mt-2 text-[14px] font-medium text-ink-2">Suma si tienes</h3>
              <ul className="flex flex-col gap-2.5">
                {job.desirable.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-[15px] text-ink-2">
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-3" />
                    {r}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
          <p className="max-w-[640px] text-[13.5px] text-ink-3">
            Si tu experiencia es con una herramienta parecida, igual cuenta: revisamos lo que hiciste, no solo las palabras exactas.
          </p>
        </section>

        <section className="flex flex-col gap-2 rounded-2xl bg-surface-2 px-5 py-4 ring-1 ring-border" style={{ "--i": 3 } as React.CSSProperties}>
          <h2 className="text-[14px] font-medium">Cómo revisamos tu hoja de vida</h2>
          <p className="text-[13.5px] leading-relaxed text-ink-2">
            Una IA la compara con los requisitos del cargo y una persona del equipo decide. Antes de evaluarla quitamos tu foto, edad, género, dirección, nacionalidad y estado
            civil: no cuentan para nada.
          </p>
        </section>
      </article>

      <aside className="lg:sticky lg:top-[88px] lg:self-start">
        <ApplyForm jobId={job.id} company={job.company} />
      </aside>
    </div>
  );
}
