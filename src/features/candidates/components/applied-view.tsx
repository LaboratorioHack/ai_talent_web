import { ButtonLink } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { PublicJob } from "../types/public";

const NEXT = [
  { title: "Revisamos tu hoja de vida", detail: "La comparamos con los requisitos del cargo. Tu foto, edad y datos personales no cuentan." },
  { title: "Una persona decide", detail: "Alguien del equipo de selección mira el resultado antes de avanzar o cerrar el proceso." },
  { title: "Te escribimos al correo", detail: "Si avanzas, recibes un enlace para una entrevista corta por chat, a la hora que te quede bien." },
];

/** Pantalla 17 · Postulación recibida. Sin puntajes ni posiciones: solo qué sigue. */
export function AppliedView({ job }: { job: PublicJob }) {
  return (
    <div className="stagger mx-auto flex w-full max-w-[640px] flex-col items-center gap-10 px-4 pt-14 pb-16 text-center sm:px-6 [&>*]:animate-rise">
      <div className="flex flex-col items-center gap-5" style={{ "--i": 0 } as React.CSSProperties}>
        <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
          <circle cx="32" cy="32" r="29" fill="none" stroke="var(--success)" strokeWidth="3" className="done-circle" />
          <path d="M20 33l8 8 16-17" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="done-check" />
        </svg>
        <div className="flex flex-col gap-2">
          <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.01em] sm:text-[34px]">Recibimos tu postulación</h1>
          <p className="text-[15px] text-ink-2">
            {job.title} en {job.company}. Te enviamos una copia al correo.
          </p>
        </div>
      </div>

      <ol className="flex w-full flex-col divide-y divide-border border-y border-border text-left" style={{ "--i": 1 } as React.CSSProperties}>
        {NEXT.map((n, i) => (
          <li key={n.title} className="flex gap-4 py-4">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[12px] font-semibold text-ink-2 ring-1 ring-border">{i + 1}</span>
            <span className="flex flex-col gap-0.5">
              <span className="text-[14.5px] font-medium">{n.title}</span>
              <span className="text-[13.5px] text-ink-2">{n.detail}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col items-center gap-3" style={{ "--i": 2 } as React.CSSProperties}>
        <div className="flex flex-wrap justify-center gap-2">
          <ButtonLink href={routes.portal}>Seguir mi postulación</ButtonLink>
          <ButtonLink href={routes.apply(job.id)} variant="outline">
            Volver a la vacante
          </ButtonLink>
        </div>
        <p className="text-xs text-ink-3">En tu portal ves en qué etapa va, respondes la entrevista y puedes retirarte o borrar tus datos.</p>
      </div>
    </div>
  );
}
