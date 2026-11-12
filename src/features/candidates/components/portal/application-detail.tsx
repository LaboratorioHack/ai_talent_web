"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Button, Modal, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { PortalApplication } from "../../types/portal";
import { NextStep } from "./next-step";
import { outcomeLabel, StageTrack, STAGES } from "./stage-track";

const day = (iso?: string) => {
  const d = iso ? fromISODate(iso) : null;
  return d ? formatLongDate(d) : "";
};

const NEXT: Record<string, string> = {
  received: "Leemos tu hoja de vida.",
  review: "Criba AI compara tu experiencia con los requisitos; una persona del equipo revisa.",
  interview: "Criba AI te hace unas preguntas cortas por chat.",
  decision: "El equipo decide y te escribe.",
};

/** Detalle de una postulación: dónde va, qué pasó y qué sigue. Sin cajas: texto, líneas y una acción. */
export function ApplicationDetail({ application }: { application: PortalApplication }) {
  const { toast } = useToast();
  const [a, setA] = useState(application);
  const [confirm, setConfirm] = useState(false);
  const status = outcomeLabel(a);
  const current = STAGES.findIndex((s) => s.key === a.stage);

  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-10 px-4 pt-10 pb-20 sm:px-6 lg:pt-14">
      <Link href={routes.portal} className="inline-flex w-fit items-center gap-1.5 text-[13.5px] text-ink-3 transition-colors hover:text-ink">
        <ArrowLeft aria-hidden className="size-4" />
        Mis postulaciones
      </Link>

      <header className="flex flex-col gap-3 animate-rise">
        <p className={cn("text-[14px] font-medium", status.text)}>{status.label}</p>
        <h1 className="font-head text-[36px] leading-[1.02] font-semibold tracking-[-0.025em] sm:text-[52px]">{a.jobTitle}</h1>
        <p className="text-[14px] text-ink-3">
          {a.company} · {a.location}, {a.modality.toLowerCase()} · te postulaste el {day(a.appliedAt)}
        </p>
      </header>

      <div className="animate-rise [animation-delay:60ms]">
        <StageTrack application={a} />
      </div>

      {a.interviewToken && a.outcome === "open" ? (
        <div className="animate-rise [animation-delay:100ms]">
          <NextStep application={a} />
        </div>
      ) : null}

      <section className="flex flex-col animate-rise [animation-delay:140ms]">
        <h2 className="mb-2 text-[13px] text-ink-3">Lo que ha pasado</h2>
        <ol className="panel flex flex-col divide-y divide-border px-5">
          {STAGES.map((s, i) => {
            const reached = a.history.find((h) => h.stage === s.key);
            const isCurrent = i === current;
            return (
              <li key={s.key} className={cn("grid grid-cols-[140px_minmax(0,1fr)] gap-4 py-4 text-[14px]", !reached && "text-ink-3")}>
                <span className="flex flex-col">
                  <span className={cn("font-medium", reached ? "text-ink" : "text-ink-3")}>{s.label}</span>
                  <span className="text-[12.5px] text-ink-3">{reached ? day(reached.at) : "Pendiente"}</span>
                </span>
                <span className={cn("leading-relaxed", reached ? "text-ink-2" : "text-ink-3")}>{isCurrent ? a.note : NEXT[s.key]}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 text-[13.5px]">
        <Link href={routes.apply(a.jobId)} className="inline-flex items-center gap-1 text-ink-2 transition-colors hover:text-ink">
          Ver la vacante
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
        {a.outcome === "open" ? (
          <button type="button" onClick={() => setConfirm(true)} className="text-ink-3 transition-colors hover:text-danger">
            Retirar mi postulación
          </button>
        ) : null}
      </footer>

      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Retirar tu postulación"
        description={`Dejarás de participar en ${a.jobTitle}. La empresa ya no verá tu hoja de vida para esta vacante.`}
        size="sm"
        footer={
          <>
            <Button variant="text" onClick={() => setConfirm(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setA((x) => ({ ...x, outcome: "withdrawn", interviewToken: undefined, note: "Retiraste esta postulación. Puedes volver a postularte mientras la vacante siga abierta." }));
                setConfirm(false);
                toast({ title: "Postulación retirada", description: a.jobTitle, action: { label: "Deshacer", onClick: () => setA(application) } });
              }}
            >
              Retirar
            </Button>
          </>
        }
      />
    </div>
  );
}
