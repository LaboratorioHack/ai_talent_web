import { CalendarClock, Clock, FileSignature, MapPin, Monitor, Wallet, type LucideIcon } from "lucide-react";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { alsoCountsText, groupOf, inferExperience, inferLanguage, inferLevel, type RequirementGroup } from "../lib/infer";
import type { PublicJob, PublicRequirement } from "../types/public";
import { ApplyForm } from "./apply-form";
import { FitCheck } from "./fit-check";

const GROUP_ORDER: RequirementGroup[] = ["Experiencia", "Conocimientos", "Idiomas", "Formación", "Sector"];

const STEPS = [
  { title: "Te postulas", detail: "Con la hoja de vida que ya tienes." },
  { title: "Revisan tu perfil", detail: "Sin tu foto ni tus datos personales." },
  { title: "Entrevista por chat", detail: "Unas preguntas cortas, cuando puedas." },
  { title: "Te responden", detail: "Avances o no, te escriben." },
];

function grouped(list: PublicRequirement[]) {
  const map = new Map<RequirementGroup, PublicRequirement[]>();
  list.forEach((r) => map.set(groupOf(r), [...(map.get(groupOf(r)) ?? []), r]));
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
}

/**
 * Pantalla 16 · Vacante pública, como ficha de portal de empleo pero sin
 * cajas: datos clave en una línea, lo que se pide agrupado, lo que se deduce
 * y el proceso. Solo el formulario va en un panel. Nunca pesos ni puntajes.
 */
export function PublicJobView({ job }: { job: PublicJob }) {
  const closes = fromISODate(job.closesAt);
  const posted = fromISODate(job.postedAt);
  const experience = inferExperience(job);
  const language = inferLanguage(job);

  const facts: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: MapPin, label: "Ubicación", value: job.location },
    { icon: Monitor, label: "Modalidad", value: job.modality },
    { icon: FileSignature, label: "Contrato", value: job.contract },
    { icon: Clock, label: "Jornada", value: job.schedule },
    { icon: Wallet, label: "Salario", value: job.salary ?? "A convenir" },
    { icon: CalendarClock, label: "Cierra", value: closes ? formatLongDate(closes) : "Abierta" },
  ];
  const profile = [
    { label: "Nivel", value: inferLevel(job.title) },
    { label: "Experiencia", value: experience.value },
    ...(language ? [{ label: "Idioma", value: language }] : []),
    { label: "Área", value: job.area },
  ];

  return (
    <div className="mx-auto grid w-full max-w-[1120px] grid-cols-1 gap-12 px-4 pt-10 pb-20 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 lg:px-8 lg:pt-14">
      <article className="stagger flex min-w-0 flex-col gap-12 [&>*]:animate-rise">
        <header className="flex flex-col gap-6" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-ink-3">
              {job.company} · {job.openings} {job.openings === 1 ? "plaza" : "plazas"}
              {posted ? ` · publicada el ${formatLongDate(posted)}` : ""}
            </p>
            <h1 className="font-head text-[36px] leading-[1.02] font-semibold tracking-[-0.02em] text-balance sm:text-[52px]">{job.title}</h1>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-y border-border py-5 sm:grid-cols-3">
            {facts.map((f) => (
              <div key={f.label} className="flex items-start gap-2.5">
                <f.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
                <div className="flex flex-col">
                  <dt className="text-[12px] text-ink-3">{f.label}</dt>
                  <dd className="text-[14.5px]">{f.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </header>

        {job.description ? (
          <section className="flex flex-col gap-3" style={{ "--i": 1 } as React.CSSProperties}>
            <h2 className="text-[13px] text-ink-3">El cargo</h2>
            <p className="max-w-[640px] text-[17px] leading-relaxed text-ink">{job.description}</p>
          </section>
        ) : null}

        <section className="flex flex-col gap-3" style={{ "--i": 2 } as React.CSSProperties}>
          <h2 className="text-[13px] text-ink-3">El perfil en corto</h2>
          <p className="flex flex-wrap items-baseline gap-x-6 gap-y-2 text-[15px]">
            {profile.map((p) => (
              <span key={p.label}>
                <span className="text-ink-3">{p.label} </span>
                <span className="font-medium">{p.value}</span>
              </span>
            ))}
          </p>
        </section>

        <section className="flex flex-col gap-4" style={{ "--i": 3 } as React.CSSProperties}>
          <h2 className="text-[13px] text-ink-3">Lo que buscamos</h2>
          <dl className="flex flex-col divide-y divide-border border-y border-border">
            {grouped(job.mandatory).map(({ group, items }) => (
              <div key={group} className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                <dt className="text-[13.5px] text-ink-3">{group}</dt>
                <dd className="flex flex-col gap-2">
                  {items.map((r) => {
                    const also = alsoCountsText(r);
                    return (
                      <span key={r.text} className="flex flex-wrap items-baseline gap-x-3">
                        <span className="text-[15.5px] font-medium">{r.text}</span>
                        {also ? <span className="text-[13px] text-amber">{also}</span> : null}
                      </span>
                    );
                  })}
                </dd>
              </div>
            ))}
            {job.desirable.length ? (
              <div className="grid grid-cols-1 gap-2 py-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-6">
                <dt className="text-[13.5px] text-ink-3">Suma si tienes</dt>
                <dd className="text-[15px] text-ink-2">{job.desirable.map((r) => r.text).join(" · ")}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="flex flex-col gap-4" style={{ "--i": 4 } as React.CSSProperties}>
          <h2 className="text-[13px] text-ink-3">Cómo es el proceso</h2>
          <ol className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex flex-col gap-1.5 border-t-2 border-border-strong pt-3 first:border-amber">
                <span className="font-mono text-[12px] text-ink-3">0{i + 1}</span>
                <span className="text-[14.5px] font-medium">{s.title}</span>
                <span className="text-[13px] leading-snug text-ink-3">{s.detail}</span>
              </li>
            ))}
          </ol>
        </section>
      </article>

      <aside id="postularme" className="flex scroll-mt-24 flex-col gap-8 lg:self-start">
        <FitCheck mandatory={job.mandatory} />
        <ApplyForm jobId={job.id} company={job.company} />
      </aside>
    </div>
  );
}
