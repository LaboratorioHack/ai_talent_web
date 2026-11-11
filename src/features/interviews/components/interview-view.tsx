"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarPlus, Check, ChevronRight, Download, Minus, Radio, Send, X } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { Avatar, Button, LogoMark, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { Interview, InterviewTurn } from "@/shared/types/domain";
import { RECOMMENDATION, STATUS, when } from "./interview-meta";
import { DiscardInterviewModal, ScheduleModal } from "./interview-modals";

/** Lo que "responderá" en vivo la entrevista en curso del mock. */
const SCRIPT: Record<number, Pick<InterviewTurn, "question" | "answer" | "verdict">> = {
  6: { question: "¿Cuántos ambientes manejaban con Terraform?", answer: "Tres: desarrollo, pruebas y producción, con módulos compartidos.", verdict: "match" },
  7: { question: "¿Tienes alguna certificación de Azure en curso?", answer: "Tengo la de AWS Professional; la de Azure Architect la presento en enero.", verdict: "match" },
  8: { question: "¿Has trabajado con regulación financiera?", answer: "Sí, con auditorías trimestrales sobre cambios en producción.", verdict: "match" },
  9: { question: "¿Qué te gustaría preguntarnos?", answer: "Cómo se reparte la guardia y qué tanto se automatiza hoy.", verdict: "match" },
};

const VERDICT_ICON = { match: Check, conflict: AlertTriangle, missing: Minus } as const;

function download(iv: Interview, turns: InterviewTurn[]) {
  const lines = [
    `Entrevista de ${iv.candidate.name}, ${iv.jobTitle}`,
    `Inicio: ${when(iv.startedAt)}`,
    "",
    ...turns.filter((t) => t.question).flatMap((t) => [`Pregunta ${t.order} (${t.topic}): ${t.question}`, `Respuesta: ${t.answer ?? "(sin respuesta)"}`, ""]),
    "Contraste con la hoja de vida",
    ...iv.contrasts.map((c) => `${c.label}: hoja de vida ${c.cvSays}, entrevista ${c.interviewSays}`),
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `entrevista_${iv.candidate.name.toLowerCase().replace(/\s+/g, "_")}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Pantalla 09 · Entrevista IA · Transcripción y contraste con la hoja de vida. */
export function InterviewView({ interview: iv }: { interview: Interview }) {
  const router = useRouter();
  const { toast } = useToast();
  const [turns, setTurns] = useState(iv.turns);
  const [status, setStatus] = useState(iv.status);
  const [modal, setModal] = useState<"schedule" | "discard" | null>(null);
  const [flash, setFlash] = useState<number | null>(null);
  const list = useRef<HTMLOListElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const first = iv.candidate.name.split(" ")[0];

  // Simulación en vivo: cada pocos segundos llega una respuesta y la siguiente pregunta.
  useEffect(() => {
    if (status !== "IN_PROGRESS") return;
    const pending = turns.find((t) => !t.answer);
    if (!pending) {
      const t = window.setTimeout(() => {
        setStatus("DONE");
        toast({ title: `${first} terminó la entrevista`, description: "Revisa el contraste con la hoja de vida antes de decidir." });
      }, 1200);
      return () => window.clearTimeout(t);
    }
    const script = SCRIPT[pending.order];
    const t = window.setTimeout(() => {
      setTurns((all) =>
        all.map((x) => {
          if (x.order === pending.order) return { ...x, question: x.question || script?.question || "", answer: script?.answer ?? "Respuesta registrada.", verdict: script?.verdict ?? "match" };
          if (x.order === pending.order + 1 && !x.question) return { ...x, question: SCRIPT[x.order]?.question ?? "" };
          return x;
        }),
      );
    }, 5200);
    return () => window.clearTimeout(t);
  }, [turns, status, first, toast]);

  // El chat abre mostrando lo último y baja solo cuando llega un mensaje nuevo.
  const answeredCount = turns.filter((t) => t.answer).length;
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: answeredCount === iv.turns.filter((t) => t.answer).length ? "auto" : "smooth" });
  }, [answeredCount, iv.turns]);

  const shown = turns.filter((t) => t.question);
  const current = status === "IN_PROGRESS" ? turns.find((t) => !t.answer)?.order : undefined;
  const answered = turns.filter((t) => t.answer).length;
  const rec = status === "DONE" && iv.recommendation ? RECOMMENDATION[iv.recommendation] : null;

  function jump(order: number) {
    const el = list.current?.querySelector<HTMLElement>(`[data-order="${order}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setFlash(order);
    window.setTimeout(() => setFlash(null), 1400);
  }

  return (
    <div className="flex h-[calc(100dvh-var(--app-header,0px))] flex-col">
      <PageTop
        sticky={false}
        eyebrow={
          <nav aria-label="Ruta" className="flex items-center gap-1.5">
            <Link href={routes.interviews} className="transition-colors hover:text-ink">
              Entrevistas
            </Link>
            <ChevronRight aria-hidden className="size-3.5" />
            <span className="text-ink-2">{iv.jobTitle}</span>
          </nav>
        }
        title={iv.candidate.name}
        description={status === "SCHEDULED" ? `Invitación enviada, responde hasta el ${when(iv.startedAt).split(",")[0]}` : `${iv.totalQuestions} preguntas, ${iv.durationMin || 14} minutos, empezó el ${when(iv.startedAt)}`}
        actions={
          <>
            <span key={status} className={cn("mr-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium animate-[pop-in_400ms_var(--ease-spring)_both]", STATUS[status].tone)}>
              {status === "IN_PROGRESS" ? <Radio aria-hidden className="size-3.5 animate-breathe" /> : status === "DONE" ? <Check aria-hidden className="size-3.5" /> : null}
              {STATUS[status].label}
            </span>
            <Button variant="text" icon={<X />} onClick={() => setModal("discard")} className="text-ink-2 hover:text-danger">
              Descartar
            </Button>
            <Button
              variant="outline"
              icon={<Download />}
              disabled={status === "SCHEDULED"}
              onClick={() => {
                download(iv, turns);
                toast({ title: "Transcripción descargada", description: "Incluye preguntas, respuestas y el contraste." });
              }}
            >
              Descargar transcripción
            </Button>
            <Button icon={<CalendarPlus />} disabled={status !== "DONE"} onClick={() => setModal("schedule")}>
              Programar con el equipo
            </Button>
          </>
        }
      />

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-[1fr_440px] border-t border-border">
        <section className="flex min-h-0 min-w-0 flex-col">
          {status === "SCHEDULED" ? (
            <div className="m-auto flex flex-col items-center gap-4 px-12 text-center animate-rise">
              <Avatar name={iv.candidate.name} size={64} />
              <h2 className="font-head text-[24px] font-semibold">{first} todavía no empieza la entrevista</h2>
              <p className="max-w-[420px] text-[14px] text-ink-2">Le enviamos el enlace con {iv.totalQuestions} preguntas sobre lo que falta validar. Te avisamos cuando termine.</p>
              <Button variant="outline" icon={<Send />} onClick={() => toast({ title: "Invitación reenviada", description: `${first} recibe un recordatorio por correo.` })}>
                Reenviar invitación
              </Button>
            </div>
          ) : (
            <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth px-12">
              <ol ref={list} className="mx-auto flex min-h-full w-full max-w-[780px] flex-col justify-end gap-6 pt-10 pb-10">
                {shown.map((t, i) => (
                  <li
                    key={t.order}
                    data-order={t.order}
                    className={cn("flex flex-col gap-3 rounded-2xl p-2 transition-[background-color] duration-700", flash === t.order && "bg-amber/10")}
                    style={{ animation: `rise 520ms var(--ease-out-soft) ${Math.max(0, i - shown.length + 5) * 60}ms both` }}
                  >
                    <div className="flex items-end gap-3">
                      <span className="mb-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border"><LogoMark size={16} /></span>
                      <div className="flex max-w-[600px] flex-col gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-3 ring-1 ring-border">
                        <span className="text-[12px] font-medium text-blue">
                          Pregunta {t.order}, {t.topic}
                        </span>
                        <p className="text-[15px] leading-snug text-ink">{t.question}</p>
                      </div>
                    </div>
                    {t.answer ? (
                      <div className="flex items-end justify-end gap-3">
                        <div className="flex flex-col items-end gap-1.5">
                          <p className={cn("flex max-w-[560px] items-start gap-3 rounded-2xl rounded-br-md px-4 py-3 text-[14.5px] leading-relaxed", t.verdict === "conflict" ? "bg-warning-soft" : "bg-ink text-ink-inverse")}>
                            <span className="flex-1">{t.answer}</span>
                            {t.verdict === "conflict" ? <AlertTriangle aria-label="Contradice la hoja de vida" className="mt-1 size-4 shrink-0 text-warning" /> : <Check aria-label="Coincide con la hoja de vida" className="mt-1 size-4 shrink-0 text-amber" />}
                          </p>
                          {t.verdict === "conflict" ? <span className="text-[12.5px] text-warning">No coincide con la hoja de vida, revísalo en el contraste</span> : null}
                        </div>
                        <Avatar name={iv.candidate.name} size={28} className="mb-1" />
                      </div>
                    ) : t.order === current ? (
                      <div className="flex items-end justify-end gap-3" aria-live="polite">
                        <div className="flex items-center gap-2.5 rounded-2xl rounded-br-md bg-surface px-4 py-3 text-[13px] text-ink-3 ring-1 ring-border">
                          <span className="flex gap-1" aria-hidden>
                            {[0, 1, 2].map((d) => (
                              <span key={d} className="size-1.5 rounded-full bg-ink-3 animate-[breathe_1.2s_ease-in-out_infinite]" style={{ animationDelay: `${d * 160}ms` }} />
                            ))}
                          </span>
                          {first} está respondiendo
                        </div>
                        <Avatar name={iv.candidate.name} size={28} className="mb-1" />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        <aside className="flex min-h-0 flex-col border-l border-border bg-surface">
          <div className="flex flex-1 flex-col gap-8 overflow-y-auto px-8 pt-7 pb-10">
            <section className="flex flex-col gap-3">
              <header className="flex items-baseline justify-between">
                <h2 className="font-head text-[19px] font-semibold">Preguntas</h2>
                <span className="text-[12.5px] text-ink-3 tabular-nums">
                  {answered} de {iv.totalQuestions}
                </span>
              </header>
              <div className="grid grid-cols-9 gap-1.5">
                {turns.map((t) => (
                  <button
                    key={t.order}
                    type="button"
                    disabled={!t.question}
                    onClick={() => jump(t.order)}
                    aria-label={`Pregunta ${t.order}${t.verdict === "conflict" ? ", contradice la hoja de vida" : t.answer ? ", coincide" : ""}`}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-lg text-[13px] font-medium tabular-nums transition-[background-color,color,transform] duration-500 ease-[var(--ease-spring)] enabled:hover:-translate-y-0.5",
                      t.verdict === "conflict" ? "bg-warning-soft text-warning" : t.answer ? "bg-success-soft text-success" : t.order === current ? "bg-ink text-ink-inverse" : "text-ink-3 ring-1 ring-border",
                    )}
                  >
                    {t.order}
                  </button>
                ))}
              </div>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-ink-3">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-success" />
                  Coincide con la hoja de vida
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-amber" />
                  La contradice
                </span>
                {status === "IN_PROGRESS" ? (
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-ink" />
                    En curso
                  </span>
                ) : null}
              </p>
            </section>

            {rec ? (
              <section className="flex flex-col gap-1 rounded-xl bg-surface-2 px-4 py-3.5 animate-rise">
                <span className="text-[12.5px] text-ink-3">Sugerencia de Criba</span>
                <span className={cn("text-[15px] font-semibold", rec.tone)}>{rec.label}</span>
                <span className="text-[12.5px] text-ink-2">La decisión es de tu equipo; queda registrada en la auditoría.</span>
              </section>
            ) : null}

            {iv.contrasts.length ? (
              <section className="flex flex-col gap-3">
                <h2 className="font-head text-[19px] font-semibold">Contraste con la hoja de vida</h2>
                <div className="grid grid-cols-[1fr_auto_auto_20px] gap-x-4 text-[12px] text-ink-3">
                  <span>Dato</span>
                  <span className="w-20">Hoja de vida</span>
                  <span className="w-20">Entrevista</span>
                  <span />
                </div>
                <ul className="flex flex-col">
                  {iv.contrasts.map((c, i) => {
                    const Icon = VERDICT_ICON[c.verdict];
                    return (
                      <li key={c.label} className="grid grid-cols-[1fr_auto_auto_20px] items-center gap-x-4 border-t border-border py-3 text-[13.5px] animate-[option-in_380ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${i * 60}ms` }}>
                        <span className="font-medium">{c.label}</span>
                        <span className="w-20 text-[13px] text-ink-2 tabular-nums">{c.cvSays}</span>
                        <span className={cn("w-20 text-[13px] tabular-nums", c.verdict === "conflict" ? "font-semibold text-warning" : "text-ink-2")}>{c.interviewSays}</span>
                        <Icon aria-label={c.verdict === "match" ? "Coincide" : c.verdict === "conflict" ? "No coincide" : "Sin dato"} className={cn("size-4", c.verdict === "match" ? "text-success" : c.verdict === "conflict" ? "text-warning" : "text-ink-3")} />
                      </li>
                    );
                  })}
                </ul>
                <p className="text-[12px] text-ink-3">Las diferencias se marcan; la decisión es tuya.</p>
              </section>
            ) : null}
          </div>

        </aside>
      </div>

      <ScheduleModal
        name={iv.candidate.name}
        open={modal === "schedule"}
        onClose={() => setModal(null)}
        onScheduled={(summary) => {
          setModal(null);
          toast({ title: "Entrevista programada", description: `${first} y tu equipo, el ${summary}.` });
        }}
      />
      <DiscardInterviewModal
        name={iv.candidate.name}
        open={modal === "discard"}
        onClose={() => setModal(null)}
        onDiscard={(reason) => {
          setModal(null);
          toast({ title: `Descartaste a ${iv.candidate.name}`, description: `${reason}. Quedó en la auditoría.` });
          router.push(routes.interviews);
        }}
      />
    </div>
  );
}
