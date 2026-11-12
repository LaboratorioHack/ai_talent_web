import {
  BarChart3,
  Briefcase,
  Building2,
  CalendarClock,
  Clock,
  FileSignature,
  GraduationCap,
  Landmark,
  Languages,
  MapPin,
  MessageSquareText,
  Send,
  ShieldCheck,
  UserCheck,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { alsoCountsText, groupOf, inferExperience, inferLanguage, inferLevel, type RequirementGroup } from "../lib/infer";
import type { PublicJob, PublicRequirement } from "../types/public";
import { ApplyForm } from "./apply-form";
import { FitCheck } from "./fit-check";

const GROUP_ICON: Record<RequirementGroup, LucideIcon> = {
  Experiencia: Briefcase,
  Conocimientos: Wrench,
  Idiomas: Languages,
  Formación: GraduationCap,
  Sector: Landmark,
};
const GROUP_ORDER: RequirementGroup[] = ["Experiencia", "Conocimientos", "Idiomas", "Formación", "Sector"];

const STEPS = [
  { icon: Send, title: "Te postulas", detail: "Con la hoja de vida que ya tienes. Dos minutos." },
  { icon: ShieldCheck, title: "Revisión anónima", detail: "La IA compara tu experiencia con el cargo, sin tu foto ni tus datos personales." },
  { icon: MessageSquareText, title: "Entrevista por chat", detail: "Si avanzas, respondes unas preguntas por texto cuando te quede bien." },
  { icon: UserCheck, title: "Decide una persona", detail: "El equipo de selección toma la decisión y te escribe." },
];

function grouped(list: PublicRequirement[]) {
  const map = new Map<RequirementGroup, PublicRequirement[]>();
  list.forEach((r) => {
    const g = groupOf(r);
    map.set(g, [...(map.get(g) ?? []), r]);
  });
  return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: map.get(g)! }));
}

/**
 * Pantalla 16 · Vacante pública. Como una ficha de portal de empleo: datos
 * clave con iconos, lo que se pide agrupado, lo que se deduce (nivel,
 * experiencia, equivalencias), un "¿encajas?" y el proceso paso a paso.
 * Nunca muestra pesos, puntajes ni requisitos descalificantes.
 */
export function PublicJobView({ job }: { job: PublicJob }) {
  const closes = fromISODate(job.closesAt);
  const posted = fromISODate(job.postedAt);
  const level = inferLevel(job.title);
  const experience = inferExperience(job);
  const language = inferLanguage(job);

  const facts: { icon: LucideIcon; label: string; value: string; hint?: string }[] = [
    { icon: MapPin, label: "Ubicación", value: job.location },
    { icon: Building2, label: "Modalidad", value: job.modality },
    { icon: FileSignature, label: "Contrato", value: job.contract },
    { icon: Clock, label: "Jornada", value: job.schedule },
    { icon: Wallet, label: "Salario", value: job.salary ?? "A convenir" },
    { icon: CalendarClock, label: "Cierra", value: closes ? formatLongDate(closes) : "Abierta" },
  ];
  const inferred = [
    { icon: BarChart3, label: "Nivel", value: level },
    { icon: Briefcase, label: "Experiencia", value: experience.value, hint: experience.inferred ? "según el nivel" : undefined },
    ...(language ? [{ icon: Languages, label: "Idioma", value: language }] : []),
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-8 px-4 pt-8 pb-16 sm:px-6 sm:pt-10 lg:px-8">
      {/* Cabecera de la ficha */}
      <header className="card stagger flex flex-col gap-6 overflow-hidden p-5 sm:p-8 [&>*]:animate-rise">
        <div className="flex flex-wrap items-start justify-between gap-4" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="flex min-w-0 flex-col gap-2">
            <p className="flex items-center gap-2 text-[14px] text-ink-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-amber/20 text-[#b26d06]">
                <Building2 aria-hidden className="size-4" />
              </span>
              {job.company}
            </p>
            <h1 className="font-head text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] text-balance sm:text-[42px]">{job.title}</h1>
            <p className="text-[13.5px] text-ink-3">
              {job.area} · {job.openings} {job.openings === 1 ? "plaza" : "plazas"}
              {posted ? ` · Publicada el ${formatLongDate(posted)}` : ""}
            </p>
          </div>
          <a href="#postularme" className="inline-flex h-11 items-center gap-2 rounded-full bg-ink px-5 text-[14px] font-medium text-ink-inverse transition-[background-color,box-shadow] duration-300 hover:bg-panel-2 lg:hidden">
            <Send aria-hidden className="size-4" />
            Postularme
          </a>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-6" style={{ "--i": 1 } as React.CSSProperties}>
          {facts.map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5 bg-surface px-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-[12px] text-ink-3">
                <f.icon aria-hidden className="size-3.5" />
                {f.label}
              </dt>
              <dd className="text-[14px] font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10">
        <article className="stagger flex min-w-0 flex-col gap-8 [&>*]:animate-rise">
          {/* Lo que se deduce */}
          <section className="flex flex-col gap-3" style={{ "--i": 0 } as React.CSSProperties}>
            <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">El perfil en corto</h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {inferred.map((x) => (
                <li key={x.label} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
                    <x.icon aria-hidden className="size-[18px]" />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="text-[12px] text-ink-3">
                      {x.label}
                      {"hint" in x && x.hint ? <span className="text-ink-3/80">, {x.hint}</span> : null}
                    </span>
                    <span className="truncate text-[15px] font-semibold">{x.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {job.description ? (
            <section className="flex flex-col gap-3" style={{ "--i": 1 } as React.CSSProperties}>
              <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">El cargo</h2>
              <p className="max-w-[680px] text-[15.5px] leading-relaxed text-ink-2">{job.description}</p>
            </section>
          ) : null}

          {/* Lo que se pide, agrupado */}
          <section className="flex flex-col gap-4" style={{ "--i": 2 } as React.CSSProperties}>
            <div className="flex flex-col gap-1">
              <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">Lo que buscamos</h2>
              <p className="text-[13.5px] text-ink-3">Revisamos lo que hiciste, no solo las palabras exactas: una herramienta parecida también suma.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {grouped(job.mandatory).map(({ group, items }) => {
                const Icon = GROUP_ICON[group];
                return (
                  <div key={group} className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
                    <span className="flex items-center gap-2 text-[13px] font-medium text-ink-2">
                      <Icon aria-hidden className="size-4 text-ink-3" />
                      {group}
                    </span>
                    <ul className="flex flex-col gap-2.5">
                      {items.map((r) => {
                        const also = alsoCountsText(r);
                        return (
                          <li key={r.text} className="flex flex-col gap-1">
                            <span className="text-[15px] font-medium">{r.text}</span>
                            {also ? <span className="w-fit rounded-full bg-blue-soft px-2 py-0.5 text-[12px] text-blue">{also}</span> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
            {job.desirable.length ? (
              <div className="flex flex-col gap-2.5 rounded-2xl border border-dashed border-border-strong p-4">
                <span className="text-[13px] font-medium text-ink-2">Suma si tienes</span>
                <ul className="flex flex-wrap gap-2">
                  {job.desirable.map((r) => (
                    <li key={r.text} className="rounded-full bg-surface-2 px-3 py-1.5 text-[13.5px]">
                      {r.text}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>

          {/* Proceso */}
          <section className="flex flex-col gap-4" style={{ "--i": 3 } as React.CSSProperties}>
            <h2 className="font-head text-[20px] font-semibold tracking-[-0.01em]">Cómo es el proceso</h2>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {STEPS.map((s, i) => (
                <li key={s.title} className="relative flex flex-col gap-2 rounded-2xl border border-border bg-surface p-4">
                  <span className="flex items-center justify-between">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-ink-2">
                      <s.icon aria-hidden className="size-4" />
                    </span>
                    <span className="font-mono text-[12px] text-ink-3">0{i + 1}</span>
                  </span>
                  <span className="text-[14.5px] font-semibold">{s.title}</span>
                  <span className="text-[13px] leading-snug text-ink-2">{s.detail}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Empresa */}
          <section className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-5" style={{ "--i": 4 } as React.CSSProperties}>
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-amber/20 text-[#b26d06]">
              <Building2 aria-hidden className="size-6" />
            </span>
            <span className="flex flex-col">
              <span className="text-[15px] font-semibold">{job.company}</span>
              <span className="text-[13px] text-ink-2">
                {job.companySector} · {job.companySize}
              </span>
            </span>
          </section>
        </article>

        <aside id="postularme" className="flex scroll-mt-24 flex-col gap-5 lg:self-start">
          <FitCheck mandatory={job.mandatory} />
          <ApplyForm jobId={job.id} company={job.company} />
        </aside>
      </div>
    </div>
  );
}
