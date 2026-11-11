"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Clock, MessageSquareText, Send, UserCheck } from "lucide-react";
import { Button, LogoMark, ProgressSegments } from "@/shared/components/ui";
import { formatDateDisplay, fromISODate } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/cn";
import { sendInterviewAnswer } from "../api/submit";
import type { CandidateInterview } from "../types/public";

interface Message {
  id: number;
  from: "ai" | "me";
  text: string;
}

/** Respuestas por debajo de esto reciben una repregunta (una sola por pregunta). */
const SHORT_ANSWER = 40;
const FOLLOW_UP = "Gracias. ¿Me cuentas un ejemplo concreto: qué hiciste tú y qué resultado tuvo?";

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/**
 * Pantalla 18 · Entrevista IA, vista del candidato. Solo texto: la IA pregunta,
 * la persona responde y, si la respuesta queda corta, la IA repregunta una vez.
 * El candidato nunca ve puntajes, contrastes ni la recomendación.
 */
export function InterviewRoom({ interview: iv }: { interview: CandidateInterview }) {
  const first = iv.candidateName.split(" ")[0];
  const total = iv.questions.length;
  const [phase, setPhase] = useState<"intro" | "chat" | "done" | "closed">(iv.state === "done" ? "closed" : "intro");
  const [messages, setMessages] = useState<Message[]>([]);
  const [index, setIndex] = useState(0);
  const [followed, setFollowed] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const alive = useRef(true);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  function push(from: Message["from"], text: string) {
    setMessages((m) => [...m, { id: nextId.current++, from, text }]);
  }

  /** La IA "escribe" un momento antes de mostrar su mensaje. */
  async function say(text: string) {
    setTyping(true);
    await wait(Math.min(1800, 700 + text.length * 12));
    if (!alive.current) return;
    setTyping(false);
    push("ai", text);
  }

  async function start() {
    setPhase("chat");
    await say(`Hola, ${first}. Son ${total} preguntas sobre tu experiencia. Responde con tus palabras; no hay respuestas perfectas.`);
    await say(iv.questions[0]);
    box.current?.focus();
  }

  async function send() {
    const answer = draft.trim();
    if (!answer || typing) return;
    setDraft("");
    push("me", answer);
    void sendInterviewAnswer(iv.token, index + 1, answer);

    if (answer.length < SHORT_ANSWER && !followed) {
      setFollowed(true);
      await say(FOLLOW_UP);
      return;
    }
    const next = index + 1;
    setFollowed(false);
    if (next < total) {
      setIndex(next);
      await say(iv.questions[next]);
      box.current?.focus();
      return;
    }
    setIndex(total);
    await say(`Eso es todo, ${first}. Gracias por tu tiempo.`);
    await wait(1400);
    if (alive.current) setPhase("done");
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  }

  if (phase === "closed" || phase === "done") {
    return (
      <div className="stagger mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 [&>*]:animate-rise">
        <svg viewBox="0 0 64 64" className="size-16" aria-hidden style={{ "--i": 0 } as React.CSSProperties}>
          <circle cx="32" cy="32" r="29" fill="none" stroke="var(--success)" strokeWidth="3" className="done-circle" />
          <path d="M20 33l8 8 16-17" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="done-check" />
        </svg>
        <div className="flex flex-col gap-2" style={{ "--i": 1 } as React.CSSProperties}>
          <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.01em]">{phase === "done" ? `Gracias, ${first}` : "Esta entrevista ya terminó"}</h1>
          <p className="text-[15px] text-ink-2">
            {phase === "done"
              ? `Tus respuestas llegaron a ${iv.company}. Una persona del equipo las revisa y te escribe al correo con el siguiente paso.`
              : `Ya respondiste la entrevista para ${iv.jobTitle}. Si tienes dudas, responde el correo de ${iv.company}.`}
          </p>
        </div>
      </div>
    );
  }

  if (phase === "intro") {
    const expires = fromISODate(iv.expiresAt.slice(0, 10));
    const points = [
      { icon: MessageSquareText, text: `${total} preguntas por chat, solo texto. No hay video ni voz.` },
      { icon: Clock, text: `Unos 15 minutos. Puedes responder hasta el ${expires ? formatDateDisplay(expires) : "cierre de la vacante"}.` },
      { icon: UserCheck, text: "La IA hace las preguntas; quien decide es una persona del equipo." },
    ];
    return (
      <div className="stagger mx-auto flex w-full max-w-[600px] flex-col gap-8 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 [&>*]:animate-rise">
        <div className="flex flex-col gap-3" style={{ "--i": 0 } as React.CSSProperties}>
          <p className="eyebrow">{iv.company}</p>
          <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.01em] sm:text-[36px]">Hola, {first}. Tu entrevista para {iv.jobTitle}</h1>
          <p className="text-[15px] text-ink-2">Las preguntas salen de tu hoja de vida y del cargo. Contesta con calma y con ejemplos de lo que hiciste.</p>
        </div>
        <ul className="card flex flex-col divide-y divide-border" style={{ "--i": 1 } as React.CSSProperties}>
          {points.map((p) => (
            <li key={p.text} className="flex items-start gap-3.5 px-5 py-4 text-[14px] sm:px-6">
              <p.icon aria-hidden className="mt-0.5 size-4 shrink-0 text-ink-3" />
              {p.text}
            </li>
          ))}
        </ul>
        <div className="flex justify-end" style={{ "--i": 2 } as React.CSSProperties}>
          <Button iconRight={<ArrowRight />} onClick={() => void start()}>
            Empezar la entrevista
          </Button>
        </div>
      </div>
    );
  }

  const current = Math.min(index, total - 1);
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-1 flex-col px-4 sm:px-6">
      <div className="sticky top-[var(--app-header)] z-10 -mx-4 flex flex-col gap-2 bg-bg/90 px-4 pt-4 pb-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          <span className="truncate font-medium">{iv.jobTitle}</span>
          <span className="shrink-0 text-ink-3 tabular-nums">
            Pregunta {current + 1} de {total}
          </span>
        </div>
        <ProgressSegments total={total} current={index >= total ? total - 1 : current} className="[&>span]:transition-colors [&>span]:duration-500" />
      </div>

      <ol className="flex flex-1 flex-col gap-4 py-6" aria-live="polite">
        {messages.map((m) => (
          <li key={m.id} className={cn("flex items-end gap-2.5 animate-[option-in_360ms_var(--ease-out-soft)_both]", m.from === "me" && "justify-end")}>
            {m.from === "ai" ? (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border">
                <LogoMark size={15} />
              </span>
            ) : null}
            <p
              className={cn(
                "max-w-[560px] rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed whitespace-pre-line",
                m.from === "ai" ? "rounded-bl-md bg-surface ring-1 ring-border" : "rounded-br-md bg-ink text-ink-inverse",
              )}
            >
              {m.text}
            </p>
          </li>
        ))}
        {typing ? (
          <li className="flex items-end gap-2.5 animate-[option-in_300ms_var(--ease-out-soft)_both]" aria-label="La entrevista está escribiendo">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border">
              <LogoMark size={15} />
            </span>
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-4 ring-1 ring-border">
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 rounded-full bg-ink-3 animate-breathe" style={{ animationDelay: `${d * 180}ms` }} />
              ))}
            </span>
          </li>
        ) : null}
        <div ref={end} />
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="sticky bottom-0 -mx-4 bg-bg/90 px-4 pt-2 pb-5 backdrop-blur-md sm:-mx-6 sm:px-6"
      >
        <div className="field-box flex items-end gap-2 py-2 pr-2 pl-4">
          <textarea
            ref={box}
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            aria-label="Tu respuesta"
            placeholder={typing ? "Espera la pregunta…" : "Escribe tu respuesta"}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-1.5 text-[14.5px] outline-none [field-sizing:content] placeholder:text-ink-3"
          />
          <Button type="submit" size="sm" icon={<Send />} disabled={!draft.trim() || typing} aria-label="Enviar respuesta">
            Enviar
          </Button>
        </div>
        <p className="mt-2 text-xs text-ink-3">Enter envía, Shift + Enter hace un salto de línea.</p>
      </form>
    </div>
  );
}
