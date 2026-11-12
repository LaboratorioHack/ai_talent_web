"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, CalendarClock, Check, MapPin, MessageSquareText, Undo2 } from "lucide-react";
import { Button, Modal, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { PortalApplication } from "../../types/portal";
import { outcomeLabel, StageTrack, STAGES } from "./stage-track";

const day = (iso?: string) => {
  const d = iso ? fromISODate(iso) : null;
  return d ? formatLongDate(d) : "";
};

const EXPLAIN: Record<string, string> = {
  received: "Leímos tu hoja de vida y quitamos tus datos personales antes de evaluarla.",
  review: "La IA compara tu experiencia con los requisitos y una persona del equipo revisa el resultado.",
  interview: "Unas preguntas por chat sobre tu experiencia. Las respuestas las lee una persona.",
  decision: "El equipo decide y te escribe al correo, avances o no.",
};

/** Detalle de una postulación: línea de tiempo, qué sigue y retirarse. */
export function ApplicationDetail({ application }: { application: PortalApplication }) {
  const { toast } = useToast();
  const [a, setA] = useState(application);
  const [confirm, setConfirm] = useState(false);
  const status = outcomeLabel(a);
  const current = STAGES.findIndex((s) => s.key === a.stage);

  return (
    <div className="mx-auto flex w-full max-w-[920px] flex-col gap-6 px-4 pt-8 pb-16 sm:px-6 sm:pt-10">
      <Link href={routes.portalApplications} className="inline-flex w-fit items-center gap-1.5 text-[13.5px] text-ink-2 transition-colors hover:text-ink">
        <ArrowLeft aria-hidden className="size-4" />
        Mis postulaciones
      </Link>

      <header className="card stagger flex flex-col gap-6 p-6 sm:p-8 [&>*]:animate-rise">
        <div className="flex flex-wrap items-start justify-between gap-4" style={{ "--i": 0 } as React.CSSProperties}>
          <div className="flex min-w-0 flex-col gap-1.5">
            <p className="text-[13.5px] text-ink-3">{a.company}</p>
            <h1 className="font-head text-[28px] leading-[1.1] font-semibold tracking-[-0.02em] sm:text-[34px]">{a.jobTitle}</h1>
            <p className="flex items-center gap-1 text-[13.5px] text-ink-3">
              <MapPin aria-hidden className="size-3.5" />
              {a.location}, {a.modality.toLowerCase()} · te postulaste el {day(a.appliedAt)}
            </p>
          </div>
          <span key={status.label} className={cn("rounded-full px-3 py-1.5 text-[13px] font-medium animate-[pop-in_400ms_var(--ease-spring)_both]", status.tone)}>
            {status.label}
          </span>
        </div>
        <div style={{ "--i": 1 } as React.CSSProperties}>
          <StageTrack application={a} />
        </div>
      </header>

      {a.interviewToken && a.outcome === "open" ? (
        <section className="dark-scope relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-bg p-6 text-ink sm:flex-row sm:items-center sm:justify-between sm:p-7 animate-rise">
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.22),transparent)]" />
          <div className="relative flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber/15 text-amber">
              <MessageSquareText aria-hidden className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="font-head text-[19px] font-semibold">Tienes una entrevista por chat</h2>
              <p className="flex items-center gap-1.5 text-[13.5px] text-ink-2">
                <CalendarClock aria-hidden className="size-4" />
                Respóndela antes del {day(a.interviewDue)}. Son unos 15 minutos, solo texto.
              </p>
            </div>
          </div>
          <Link href={routes.candidateInterview(a.interviewToken)} className="relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-amber px-5 text-[14px] font-semibold text-[#1a211d] transition-[filter] hover:brightness-105">
            Responder entrevista
            <ArrowRight aria-hidden className="size-4" />
          </Link>
        </section>
      ) : null}

      <section className="card flex flex-col p-6 sm:p-8 animate-rise [animation-delay:120ms]">
        <h2 className="mb-5 font-head text-[20px] font-semibold tracking-[-0.01em]">Lo que ha pasado</h2>
        <ol className="flex flex-col">
          {STAGES.map((s, i) => {
            const reached = a.history.find((h) => h.stage === s.key);
            const isCurrent = i === current && a.outcome === "open";
            return (
              <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
                {i < STAGES.length - 1 ? <span aria-hidden className={cn("absolute top-7 left-[11px] h-[calc(100%-20px)] w-[2px] rounded-full", reached && i < current ? "bg-success" : "bg-border")} /> : null}
                <span className={cn("relative mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border-2", reached ? (isCurrent ? "border-amber bg-surface" : "border-success bg-success text-ink-inverse") : "border-border-strong bg-surface")}>
                  {isCurrent ? <span className="size-2 rounded-full bg-amber animate-breathe" /> : reached ? <Check aria-hidden className="size-3.5" /> : null}
                </span>
                <div className={cn("flex flex-col gap-1", !reached && "opacity-55")}>
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-[15px] font-semibold">{s.label}</span>
                    {reached ? <span className="text-[12.5px] text-ink-3">{day(reached.at)}</span> : <span className="text-[12.5px] text-ink-3">Pendiente</span>}
                  </span>
                  <p className="text-[13.5px] leading-relaxed text-ink-2">{isCurrent || (reached && i === current) ? a.note : EXPLAIN[s.key]}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-5 py-4 animate-rise [animation-delay:180ms]">
        <Link href={routes.apply(a.jobId)} className="inline-flex items-center gap-1 text-[13.5px] text-ink-2 hover:text-ink">
          Ver la vacante
          <ArrowUpRight aria-hidden className="size-3.5" />
        </Link>
        {a.outcome === "open" ? (
          <Button variant="text" icon={<Undo2 />} onClick={() => setConfirm(true)} className="text-ink-2 hover:text-danger">
            Retirar mi postulación
          </Button>
        ) : null}
      </section>

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
