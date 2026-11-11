"use client";

import { useEffect } from "react";
import { ArrowRight, Upload } from "lucide-react";
import { ButtonLink } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { SOURCES } from "../sources";
import { useOnboarding } from "../state/onboarding-store";
import { SourceLogo } from "./source-logo";

/** Fin del onboarding: lo que quedó configurado y el siguiente paso natural. */
export function DoneStep() {
  const { data, finish } = useOnboarding();
  useEffect(() => finish(), [finish]);

  const chosen = SOURCES.filter((s) => s.id in data.sources);
  const stateLabel = (id: string) =>
    data.sources[id] === "connected" ? "Conectada" : data.sources[id] === "later" ? "Pendiente de conectar" : SOURCES.find((s) => s.id === id)?.connect === "none" ? "Lista" : "Pendiente";

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Organización", value: `${data.organization.name} · ${data.organization.sector} · ${data.organization.size} personas` },
    { label: "Equipo", value: data.invites.length ? `${data.invites.length} ${data.invites.length === 1 ? "invitación enviada" : "invitaciones enviadas"}` : "Solo tú por ahora" },
    {
      label: "Fuentes",
      value: chosen.length ? (
        <ul className="flex flex-col gap-2">
          {chosen.map((s) => (
            <li key={s.id} className="flex items-center gap-2.5">
              <SourceLogo source={s} size={24} />
              <span className="flex-1">{s.name}</span>
              <span className={data.sources[s.id] === "connected" || s.connect === "none" ? "text-success" : "text-ink-3"}>{stateLabel(s.id)}</span>
            </li>
          ))}
        </ul>
      ) : (
        "Ninguna todavía"
      ),
    },
    { label: "Primera vacante", value: data.vacancy ? `${data.vacancy.title} · ${data.vacancy.requirements} requisitos` : "Sin crear" },
  ];

  return (
    <div className="stagger flex flex-1 flex-col items-center gap-10 px-6 pt-16 pb-16 [&>*]:animate-rise">
      <div className="flex w-[600px] max-w-full flex-col items-center gap-5 text-center" style={{ "--i": 0 } as React.CSSProperties}>
        <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
          <circle cx="32" cy="32" r="29" fill="none" stroke="var(--success)" strokeWidth="3" className="done-circle" />
          <path d="M20 33l8 8 16-17" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="done-check" />
        </svg>
        <div className="flex flex-col gap-2">
          <h1 className="font-head text-[34px] leading-[1.1] font-semibold tracking-[-0.01em]">Todo listo</h1>
          <p className="text-[15px] text-ink-2">Sube las hojas de vida de tu vacante y Criba arma el ranking con sus pruebas.</p>
        </div>
      </div>

      <dl className="card w-[600px] max-w-full divide-y divide-border" style={{ "--i": 1 } as React.CSSProperties}>
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[160px_1fr] gap-4 px-7 py-4 text-[13.5px]">
            <dt className="text-ink-3">{r.label}</dt>
            <dd className="text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex w-[600px] max-w-full items-center justify-end gap-3" style={{ "--i": 2 } as React.CSSProperties}>
        <ButtonLink href={routes.home} variant="outline" iconRight={<ArrowRight />}>
          Ir al panel
        </ButtonLink>
        <ButtonLink href={routes.candidates} icon={<Upload />}>
          Subir hojas de vida
        </ButtonLink>
      </div>
    </div>
  );
}
