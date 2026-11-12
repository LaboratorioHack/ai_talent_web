"use client";

import { useEffect } from "react";
import { ArrowRight, Link2 } from "lucide-react";
import { ButtonLink } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { companySizeLabel } from "../api/company";
import { useOnboarding } from "../state/onboarding-store";

/** Fin del onboarding: lo que quedó configurado y el siguiente paso natural. */
export function DoneStep() {
  const { data, finish } = useOnboarding();
  useEffect(() => finish(), [finish]);

  const rows: { label: string; value: string }[] = [
    { label: "Organización", value: `${data.organization.name}, ${data.organization.sector.toLowerCase()}, ${companySizeLabel(data.organization.size)} personas` },
    { label: "Primera vacante", value: data.vacancy ? `${data.vacancy.title}, con ${data.vacancy.requirements} requisitos` : "Sin crear" },
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
          <p className="text-[15px] text-ink-2">Comparte el enlace de tu vacante: cada persona que se postule entra al ranking con sus pruebas.</p>
        </div>
      </div>

      <dl className="card w-[600px] max-w-full divide-y divide-border" style={{ "--i": 1 } as React.CSSProperties}>
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-1 gap-1 px-5 py-4 text-[13.5px] sm:grid-cols-[160px_1fr] sm:gap-4 sm:px-7">
            <dt className="text-ink-3">{r.label}</dt>
            <dd className="text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex w-[600px] max-w-full items-center justify-end gap-3" style={{ "--i": 2 } as React.CSSProperties}>
        <ButtonLink href={routes.home} variant="outline" iconRight={<ArrowRight />}>
          Ir al panel
        </ButtonLink>
        <ButtonLink href={routes.candidates} icon={<Link2 />}>
          Compartir la convocatoria
        </ButtonLink>
      </div>
    </div>
  );
}
