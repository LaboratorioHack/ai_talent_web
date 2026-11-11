"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Check, Clock, Minus, Radio, Send } from "lucide-react";
import { Avatar, Button, ButtonLink, Logo, ScrollArea, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { Interview } from "@/shared/types/domain";
import { RECOMMENDATION, when } from "./interview-meta";

const GROUPS: { status: Interview["status"]; title: string; hint: string }[] = [
  { status: "IN_PROGRESS", title: "En vivo ahora", hint: "Respondiendo en este momento" },
  { status: "DONE", title: "Para decidir", hint: "Terminaron; falta tu decisión" },
  { status: "SCHEDULED", title: "Esperando respuesta", hint: "Tienen el enlace y aún no empiezan" },
];

const VERDICT_ICON = { match: Check, conflict: AlertTriangle, missing: Minus } as const;

function lastLine(iv: Interview) {
  const answered = iv.turns.filter((t) => t.answer);
  const last = answered[answered.length - 1];
  if (iv.status === "SCHEDULED") return "Todavía no abre el enlace";
  if (iv.status === "IN_PROGRESS") return `Respondiendo la pregunta ${answered.length + 1} de ${iv.totalQuestions}`;
  return last?.answer ?? "";
}

/** Fila de la bandeja: como un chat, con el estado en el anillo del avatar. */
function Row({ iv, active, onSelect, index }: { iv: Interview; active: boolean; onSelect: () => void; index: number }) {
  const conflicts = iv.contrasts.filter((c) => c.verdict === "conflict").length;
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active || undefined}
      className={cn(
        "relative flex w-full items-center gap-3.5 rounded-2xl px-3 py-3 text-left transition-[background-color,box-shadow] duration-300 animate-[option-in_360ms_var(--ease-out-soft)_both]",
        active ? "bg-surface shadow-[0_1px_2px_rgba(21,32,27,0.06),0_12px_28px_-20px_rgba(21,32,27,0.5)] ring-1 ring-border" : "hover:bg-surface/70",
      )}
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <span className="relative shrink-0">
        <span className={cn("absolute -inset-[3px] rounded-full", iv.status === "IN_PROGRESS" ? "ring-2 ring-blue animate-breathe" : iv.status === "DONE" && conflicts ? "ring-2 ring-amber" : "")} />
        <Avatar name={iv.candidate.name} size={44} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-[14.5px] font-semibold">{iv.candidate.name}</span>
          <span className="shrink-0 text-[11.5px] text-ink-3">{iv.status === "SCHEDULED" ? "Pendiente" : when(iv.startedAt).split(",")[0]}</span>
        </span>
        <span className="truncate text-[12.5px] text-ink-3">{iv.jobTitle}</span>
        <span className={cn("truncate text-[13px]", iv.status === "IN_PROGRESS" ? "text-blue" : "text-ink-2")}>{lastLine(iv)}</span>
      </span>
      {conflicts && iv.status === "DONE" ? <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber text-[11px] font-semibold text-ink">{conflicts}</span> : null}
    </button>
  );
}

/** Vista previa de la conversación elegida: avance, últimos mensajes y lo que no cuadra. */
function Preview({ iv }: { iv: Interview }) {
  const { toast } = useToast();
  const answered = iv.turns.filter((t) => t.answer);
  const recent = answered.slice(-2);
  const pendingQuestion = iv.turns.find((t) => !t.answer && t.question);
  const rec = iv.recommendation ? RECOMMENDATION[iv.recommendation] : null;
  const first = iv.candidate.name.split(" ")[0];

  return (
    <article key={iv.id} className="stagger flex flex-col gap-7 [&>*]:animate-rise">
      <header className="flex items-center gap-5" style={{ "--i": 0 } as React.CSSProperties}>
        <Avatar name={iv.candidate.name} size={64} />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h2 className="truncate font-head text-[28px] leading-tight font-semibold tracking-[-0.02em]">{iv.candidate.name}</h2>
          <p className="text-[13.5px] text-ink-2">
            {iv.jobTitle}, {iv.status === "SCHEDULED" ? `invitación enviada, responde hasta el ${when(iv.startedAt).split(",")[0]}` : `empezó el ${when(iv.startedAt)}`}
          </p>
        </div>
        {iv.status !== "SCHEDULED" ? (
          <ButtonLink href={routes.interview(iv.id)} iconRight={<ArrowRight />}>
            {iv.status === "IN_PROGRESS" ? "Seguir en vivo" : "Abrir entrevista"}
          </ButtonLink>
        ) : (
          <Button variant="outline" icon={<Send />} onClick={() => toast({ title: "Invitación reenviada", description: `${first} recibe un recordatorio por correo.` })}>
            Reenviar invitación
          </Button>
        )}
      </header>

      <div className="flex flex-col gap-2" style={{ "--i": 1 } as React.CSSProperties}>
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-medium">Avance</span>
          <span className="text-ink-3 tabular-nums">
            {answered.length} de {iv.totalQuestions} preguntas{iv.durationMin ? `, ${iv.durationMin} min` : ""}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: iv.totalQuestions }, (_, k) => {
            const t = iv.turns[k];
            return (
              <span
                key={k}
                className={cn(
                  "grow-x h-2 flex-1 rounded-full",
                  t?.verdict === "conflict" ? "bg-amber" : t?.answer ? "bg-success" : iv.status === "IN_PROGRESS" && k === answered.length ? "animate-breathe bg-blue" : "bg-surface-3",
                )}
                style={{ animationDelay: `${k * 40}ms` }}
              />
            );
          })}
        </div>
      </div>

      {rec ? (
        <div className={cn("flex items-center gap-3 rounded-2xl px-5 py-4", rec.bg)} style={{ "--i": 2 } as React.CSSProperties}>
          <span className={cn("text-[15px] font-semibold", rec.tone)}>{rec.label}</span>
          <span className="text-[13px] text-ink-2">Es una sugerencia de Criba; la decisión es de tu equipo.</span>
        </div>
      ) : null}

      {iv.status !== "SCHEDULED" ? (
        <section className="flex flex-col gap-3 rounded-2xl bg-bg p-5 ring-1 ring-border" style={{ "--i": 3 } as React.CSSProperties}>
          <span className="text-[12.5px] text-ink-3">{iv.status === "IN_PROGRESS" ? "Lo último que respondió" : "Cómo terminó"}</span>
          {recent.map((t) => (
            <div key={t.order} className="flex flex-col gap-2">
              <div className="flex items-end gap-2.5">
                <Logo compact className="shrink-0 [&>span:first-child]:size-6 [&>span:first-child]:rounded-full" />
                <p className="max-w-[520px] rounded-2xl rounded-bl-md bg-surface px-3.5 py-2.5 text-[13.5px] ring-1 ring-border">{t.question}</p>
              </div>
              <div className="flex items-end justify-end gap-2.5">
                <p className={cn("max-w-[520px] rounded-2xl rounded-br-md px-3.5 py-2.5 text-[13.5px]", t.verdict === "conflict" ? "bg-warning-soft" : "bg-ink text-ink-inverse")}>{t.answer}</p>
                <Avatar name={iv.candidate.name} size={24} />
              </div>
            </div>
          ))}
          {iv.status === "IN_PROGRESS" && pendingQuestion ? (
            <div className="flex items-center justify-end gap-2 text-[12.5px] text-blue">
              <Radio aria-hidden className="size-3.5 animate-breathe" />
              {first} está respondiendo la pregunta {pendingQuestion.order}
            </div>
          ) : null}
        </section>
      ) : (
        <section className="flex flex-col items-center gap-3 rounded-2xl bg-bg px-6 py-10 text-center ring-1 ring-border" style={{ "--i": 3 } as React.CSSProperties}>
          <Clock aria-hidden className="size-6 text-ink-3" />
          <p className="max-w-[380px] text-[14px] text-ink-2">
            {first} tiene {iv.totalQuestions} preguntas sobre lo que falta validar en su hoja de vida. Te avisamos apenas empiece.
          </p>
        </section>
      )}

      {iv.contrasts.length ? (
        <section className="flex flex-col gap-2" style={{ "--i": 4 } as React.CSSProperties}>
          <span className="text-[13px] font-medium">Contraste con la hoja de vida</span>
          <ul className="grid grid-cols-2 gap-2">
            {iv.contrasts.map((c) => {
              const Icon = VERDICT_ICON[c.verdict];
              return (
                <li key={c.label} className={cn("flex items-center gap-3 rounded-xl px-3.5 py-2.5 ring-1", c.verdict === "conflict" ? "bg-warning-soft/60 ring-warning/20" : "bg-surface ring-border")}>
                  <Icon aria-hidden className={cn("size-4 shrink-0", c.verdict === "match" ? "text-success" : c.verdict === "conflict" ? "text-warning" : "text-ink-3")} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[13px] font-medium">{c.label}</span>
                    <span className="truncate text-[12px] text-ink-3">
                      Hoja de vida {c.cvSays}, entrevista {c.interviewSays}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

/**
 * Entrevistas como una bandeja de conversaciones: a la izquierda quién está
 * en vivo, quién terminó y quién no ha empezado; a la derecha la vista previa
 * de la elegida con lo último que dijo y lo que no cuadra con su hoja de vida.
 */
export function InterviewInbox({ interviews }: { interviews: Interview[] }) {
  const [selected, setSelected] = useState(interviews[0]?.id ?? null);
  const current = interviews.find((i) => i.id === selected) ?? null;
  const groups = useMemo(() => GROUPS.map((g) => ({ ...g, list: interviews.filter((i) => i.status === g.status) })).filter((g) => g.list.length), [interviews]);

  return (
    <div className="grid min-h-0 flex-1 grid-cols-[400px_1fr]">
      <ScrollArea aria-label="Entrevistas" className="border-r border-border bg-bg" viewportClassName="px-5 pt-5 pb-10">
        {groups.map((g, gi) => (
          <section key={g.status} className="flex flex-col gap-1 pb-4">
            <header className="flex items-baseline justify-between px-3 pt-2 pb-1.5">
              <h2 className="text-[13px] font-semibold">
                {g.title} <span className="font-normal text-ink-3">{g.list.length}</span>
              </h2>
              <span className="text-[11.5px] text-ink-3">{g.hint}</span>
            </header>
            {g.list.map((iv, i) => (
              <Row key={iv.id} iv={iv} index={gi * 3 + i} active={iv.id === selected} onSelect={() => setSelected(iv.id)} />
            ))}
          </section>
        ))}
        <Link href={routes.rankings} className="mx-3 mt-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border-strong py-3 text-[13px] text-ink-2 transition-colors hover:border-ink hover:text-ink">
          Invitar a alguien desde el ranking
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </ScrollArea>
      <ScrollArea aria-label="Vista previa" className="bg-surface" viewportClassName="px-12 pt-9 pb-14">
        {current ? <Preview iv={current} /> : null}
      </ScrollArea>
    </div>
  );
}
