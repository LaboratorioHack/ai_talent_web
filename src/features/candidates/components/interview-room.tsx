"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, Check, Clock, Loader2, MessageSquareText, RotateCcw, Send, UserCheck } from "lucide-react";
import { Button, ButtonLink, Collapse, CribaAi, CribaCharacter, CribaText, LogoMark } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { cn } from "@/shared/lib/cn";
import { useTypewriter } from "@/shared/hooks/use-typewriter";
import { sendInterviewAnswer } from "../api/submit";
import type { CandidateInterview } from "../types/public";

interface Message {
  id: number;
  from: "ai" | "me";
  text: string;
  /** Solo respuestas propias: se ven al instante y luego se confirman o piden reintento. */
  state?: "sending" | "sent" | "failed";
  /** Pregunta a la que responde (para reintentar sin perder el orden). */
  order?: number;
}

/** Respuestas por debajo de esto reciben una repregunta (una sola por pregunta). */
const SHORT_ANSWER = 40;
const FOLLOW_UP = "¡Gracias! Me ayudaría mucho un ejemplo concreto: ¿qué hiciste tú y qué resultado tuvo?";
/** Antes de cada pregunta, un acuse distinto: que se note que Criba leyó la respuesta. */
const ACKS = ["Gracias por contarlo, muy claro.", "Perfecto, eso me sirve mucho.", "Qué buen ejemplo, gracias.", "Entendido, gracias por el detalle.", "Muy bien, me queda claro."];
/** Lo que dura la salida de una pantalla antes de que entre la siguiente. */
const LEAVE_MS = 260;

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));

/** Chispas del cierre: ángulos repartidos alrededor del círculo, en ámbar y verde. */
const SPARKS = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  const r = 46 + (i % 3) * 8;
  return { dx: `${Math.round(Math.cos(angle) * r)}px`, dy: `${Math.round(Math.sin(angle) * r)}px`, color: i % 2 ? "var(--amber)" : "var(--success)" };
});

/**
 * Pantalla 18 · Entrevista IA, vista del candidato. Solo texto: la IA pregunta,
 * la persona responde y, si la respuesta queda corta, la IA repregunta una vez.
 * Cada paso responde al momento: la respuesta aparece de inmediato y se
 * confirma al guardarse; si falla, se reintenta desde la misma burbuja.
 * El candidato nunca ve puntajes, contrastes ni la recomendación.
 */
export function InterviewRoom({ interview: iv }: { interview: CandidateInterview }) {
  const first = iv.candidateName.split(" ")[0];
  const total = iv.questions.length;
  const [phase, setPhase] = useState<"intro" | "chat" | "done" | "closed" | "expired">(iv.state === "done" ? "closed" : iv.state === "closed" ? "expired" : "intro");
  const [leaving, setLeaving] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  // Si vuelve al enlace, sigue en la primera pregunta sin responder.
  const [index, setIndex] = useState(Math.min(iv.answered, Math.max(0, total - 1)));
  const [sendError, setSendError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [followed, setFollowed] = useState(false);
  const [typing, setTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const alive = useRef(true);
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(0);
  const acks = useRef(0);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, typing]);

  function push(from: Message["from"], text: string, extra?: Partial<Message>) {
    const id = nextId.current++;
    setMessages((m) => [...m, { id, from, text, ...extra }]);
    return id;
  }

  function mark(id: number, state: Message["state"]) {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, state } : msg)));
  }

  /** La IA "escribe" un momento antes de mostrar su mensaje. */
  async function say(text: string) {
    setTyping(true);
    await wait(Math.min(1800, 700 + text.length * 12));
    if (!alive.current) return;
    setTyping(false);
    push("ai", text);
  }

  /** Sale la pantalla actual con un fundido corto y entra la siguiente. */
  async function switchTo(next: "chat" | "done") {
    setLeaving(true);
    await wait(LEAVE_MS);
    if (!alive.current) return false;
    setLeaving(false);
    setPhase(next);
    return true;
  }

  async function start() {
    if (!(await switchTo("chat"))) return;
    await say(
      iv.answered > 0
        ? `¡Qué bueno verte de nuevo, ${first}! Te faltan ${total - index} de ${total} preguntas y seguimos justo donde quedaste.`
        : `¡Hola, ${first}! Soy Criba AI y voy a acompañarte en esta entrevista. Son ${total} preguntas sobre tu experiencia; responde con tus palabras y con calma, no hay respuestas perfectas.`,
    );
    await say(iv.questions[index]);
    box.current?.focus();
  }

  function send() {
    const answer = draft.trim();
    if (!answer || typing || sending) return;
    setDraft("");
    const id = push("me", answer, { state: "sending", order: index + 1 });
    void deliver(id, answer, index + 1);
  }

  /** Guarda la respuesta; si llega, Criba sigue la conversación. */
  async function deliver(id: number, answer: string, order: number) {
    setSendError(null);
    setSending(true);
    try {
      await sendInterviewAnswer(iv.token, order, answer);
    } catch {
      if (!alive.current) return;
      // La respuesta no se perdió: queda en su burbuja para reenviarla.
      mark(id, "failed");
      setSending(false);
      setSendError("No pudimos guardar tu respuesta. Revisa tu conexión y toca «Reintentar».");
      setShake((n) => n + 1);
      return;
    }
    if (!alive.current) return;
    mark(id, "sent");
    setSending(false);

    if (answer.length < SHORT_ANSWER && !followed) {
      setFollowed(true);
      await say(FOLLOW_UP);
      box.current?.focus();
      return;
    }
    const next = index + 1;
    setFollowed(false);
    if (next < total) {
      setIndex(next);
      const ack = ACKS[acks.current++ % ACKS.length];
      await say(`${ack}\n\n${iv.questions[next]}`);
      box.current?.focus();
      return;
    }
    setIndex(total);
    await say(`¡Eso es todo, ${first}! Muchas gracias por tu tiempo y por contarme tu experiencia con tanto detalle.`);
    await wait(1600);
    if (alive.current) await switchTo("done");
  }

  function retry(m: Message) {
    if (sending || !m.order) return;
    mark(m.id, "sending");
    void deliver(m.id, m.text, m.order);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  if (phase === "expired") {
    return (
      <div className="stagger mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6 [&>*]:animate-rise">
        <span style={{ "--i": 0 } as React.CSSProperties}>
          <CribaCharacter size={48} />
        </span>
        <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.01em]" style={{ "--i": 1 } as React.CSSProperties}>
          Este enlace ya no está activo
        </h1>
        <p className="text-[15px] text-ink-2" style={{ "--i": 2 } as React.CSSProperties}>
          La entrevista para {iv.jobTitle} venció o {iv.company} la cerró. Si crees que es un error, responde el correo de la invitación y lo revisamos.
        </p>
        <ButtonLink href={routes.portal} variant="outline" style={{ "--i": 3 } as React.CSSProperties}>
          Ir a mi portal
        </ButtonLink>
      </div>
    );
  }

  if (phase === "closed" || phase === "done") {
    return (
      <div className="stagger mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6 [&>*]:animate-rise">
        <span className="relative" style={{ "--i": 0 } as React.CSSProperties}>
          <svg viewBox="0 0 64 64" className="size-16" aria-hidden>
            <circle cx="32" cy="32" r="29" fill="none" stroke="var(--success)" strokeWidth="3" className="done-circle" />
            <path d="M20 33l8 8 16-17" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="done-check" />
          </svg>
          {phase === "done"
            ? SPARKS.map((s, i) => <span key={i} aria-hidden className="spark" style={{ "--dx": s.dx, "--dy": s.dy, background: s.color, animationDelay: `${700 + (i % 4) * 40}ms` } as React.CSSProperties} />)
            : null}
        </span>
        <div className="flex flex-col gap-2" style={{ "--i": 1 } as React.CSSProperties}>
          <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.01em]">{phase === "done" ? `¡Gracias, ${first}!` : "Esta entrevista ya terminó"}</h1>
          <p className="text-[15px] text-ink-2">
            {phase === "done"
              ? `Tus respuestas ya llegaron a ${iv.company}. Una persona del equipo las lee con calma y te escribe al correo con el siguiente paso. ¡Mucho éxito!`
              : `Ya respondiste la entrevista para ${iv.jobTitle}. Si tienes dudas, responde el correo de ${iv.company}.`}
          </p>
        </div>
        <ButtonLink href={routes.portal} variant="outline" style={{ "--i": 2 } as React.CSSProperties}>
          Ir a mi portal
        </ButtonLink>
      </div>
    );
  }

  if (phase === "intro") {
    const expires = fromISODate(iv.expiresAt.slice(0, 10));
    const points = [
      { icon: MessageSquareText, text: `${total} preguntas por chat, solo texto. No hay video ni voz.` },
      { icon: Clock, text: `Unos 15 minutos. Puedes responder hasta el ${expires ? formatLongDate(expires) : "cierre de la vacante"}; si te vas, retomas donde quedaste.` },
      { icon: UserCheck, text: "Tus respuestas las lee una persona del equipo." },
    ];
    return (
      <div className={cn("stagger mx-auto flex w-full max-w-[600px] flex-col gap-8 px-4 pt-12 pb-16 sm:px-6 sm:pt-16 [&>*]:animate-rise", leaving && "animate-leave")}>
        <div className="flex flex-col gap-3" style={{ "--i": 0 } as React.CSSProperties}>
          <CribaCharacter size={56} announce className="mb-1" />
          <p className="flex flex-wrap items-center gap-2">
            <span className="eyebrow">{iv.company}</span>
            <CribaAi label="Te entrevista por chat" />
          </p>
          <h1 className="font-head text-[30px] leading-[1.1] font-semibold tracking-[-0.01em] sm:text-[36px]">Hola, {first}. Tu entrevista para {iv.jobTitle}</h1>
          <p className="text-[15px] text-ink-2">Las preguntas salen de tu hoja de vida y del cargo. Contesta con calma y con ejemplos de lo que hiciste.</p>
        </div>
        <ul className="panel flex flex-col divide-y divide-border px-5" style={{ "--i": 1 } as React.CSSProperties}>
          {points.map((p, i) => (
            <li key={p.text} className="flex items-start gap-3.5 py-4 text-[14px] animate-[option-in_420ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${260 + i * 110}ms` }}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber/12 text-amber ring-1 ring-amber/25">
                <p.icon aria-hidden className="size-3.5" />
              </span>
              <span className="pt-1">{p.text}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-end" style={{ "--i": 2 } as React.CSSProperties}>
          <Button iconRight={<ArrowRight className="transition-transform duration-300 group-hover:translate-x-0.5" />} onClick={() => void start()} disabled={leaving} className="group">
            Empezar la entrevista
          </Button>
        </div>
      </div>
    );
  }

  const current = Math.min(index, total - 1);
  const answered = Math.min(index, total);
  // Solo la última pregunta lleva al personaje vivo; las anteriores, la marca quieta.
  const lastAi = messages.findLastIndex((m) => m.from === "ai");
  const ready = Boolean(draft.trim()) && !typing && !sending;
  return (
    <div className={cn("mx-auto flex w-full max-w-[760px] flex-1 flex-col px-4 sm:px-6 animate-[page-in_520ms_var(--ease-out-soft)_backwards]", leaving && "animate-leave")}>
      <div className="sticky top-[var(--app-header)] z-10 -mx-4 flex flex-col gap-2 bg-bg/90 px-4 pt-4 pb-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          <span className="flex min-w-0 items-center gap-2">
            <CribaAi />
            <span className="truncate font-medium">{iv.jobTitle}</span>
          </span>
          <span className="shrink-0 overflow-hidden text-ink-3 tabular-nums">
            Pregunta{" "}
            <span key={current} className="tick-up font-medium text-ink">
              {current + 1}
            </span>{" "}
            de {total}
          </span>
        </div>
        <div className="flex gap-1.5" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered} aria-label="Preguntas respondidas">
          {Array.from({ length: total }, (_, i) => (
            <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-sm bg-border">
              <span className={cn("seg-fill absolute inset-0 rounded-sm", i < answered ? "scale-x-100 bg-success" : i === current ? "scale-x-100 bg-amber" : "scale-x-0 bg-amber")} />
            </span>
          ))}
        </div>
      </div>

      <ol className="flex flex-1 flex-col gap-4 py-6" aria-live="polite">
        {messages.map((m, i) => (
          <li key={m.id} className={cn("flex items-end gap-2.5", m.from === "me" ? "justify-end animate-[bubble-out_380ms_var(--ease-spring)_both]" : "animate-[bubble-in_420ms_var(--ease-out-soft)_both]")}>
            {m.from === "ai" ? (
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border">
                {i === lastAi && !typing ? <CribaCharacter size={16} /> : <LogoMark size={15} />}
              </span>
            ) : null}
            <div className={cn("flex max-w-[560px] flex-col gap-1", m.from === "me" ? "items-end" : "items-start")}>
              <p
                className={cn(
                  "rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed whitespace-pre-line transition-[opacity,box-shadow] duration-300",
                  m.from === "ai" ? "rounded-bl-md bg-surface ring-1 ring-border" : "rounded-br-md bg-ink text-ink-inverse",
                  m.state === "sending" && "opacity-70",
                  m.state === "failed" && "ring-2 ring-danger/60",
                )}
              >
                {m.from === "me" ? m.text : i === lastAi ? <Typed text={m.text} /> : <CribaText text={m.text} />}
              </p>
              {m.from === "me" ? <Receipt message={m} onRetry={() => retry(m)} /> : null}
            </div>
          </li>
        ))}
        {typing ? (
          <li className="flex items-end gap-2.5 animate-[bubble-in_320ms_var(--ease-out-soft)_both]" aria-label="Criba AI está escribiendo">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border">
              <CribaCharacter mood="talking" size={16} />
            </span>
            <span className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-4 ring-1 ring-border">
              {[0, 1, 2].map((d) => (
                <span key={d} className="typing-dot size-1.5 rounded-full bg-ink-3" style={{ animationDelay: `${d * 140}ms` }} />
              ))}
            </span>
          </li>
        ) : null}
        <div ref={end} />
      </ol>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="sticky bottom-0 -mx-4 bg-bg/90 px-4 pt-2 pb-5 backdrop-blur-md sm:-mx-6 sm:px-6"
      >
        <div key={shake} className={cn("field-box flex items-end gap-2 py-2 pr-2 pl-4", shake > 0 && "animate-shake", sendError && "is-invalid")}>
          <textarea
            ref={box}
            rows={2}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              if (sendError) setSendError(null);
            }}
            onKeyDown={onKey}
            aria-label="Tu respuesta"
            placeholder={typing ? "Criba está escribiendo…" : "Escribe tu respuesta"}
            className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent py-1.5 text-[14.5px] outline-none [field-sizing:content] placeholder:text-ink-3"
          />
          <Button
            type="submit"
            size="sm"
            icon={<Send className={cn("transition-transform duration-300", ready && "-rotate-12")} />}
            loading={sending}
            disabled={!ready}
            aria-label="Enviar respuesta"
            className={cn("transition-[background-color,color,scale] duration-300 active:scale-95", ready && "bg-amber text-[#1a211d] hover:bg-amber")}
          >
            Enviar
          </Button>
        </div>
        <Collapse open={Boolean(sendError)}>
          <p role="alert" className="mt-2 text-[13px] text-danger">
            {sendError}
          </p>
        </Collapse>
        <p className="mt-2 text-xs text-ink-3">Enter envía, Shift + Enter hace un salto de línea.</p>
      </form>
    </div>
  );
}

/** Bajo la respuesta propia: enviando, guardada o el botón para reintentar. */
function Receipt({ message: m, onRetry }: { message: Message; onRetry: () => void }) {
  if (m.state === "failed") {
    return (
      <button type="button" onClick={onRetry} className="group inline-flex items-center gap-1.5 text-[12px] font-medium text-danger transition-[opacity,scale] duration-300 animate-fade-in hover:opacity-80 active:scale-95">
        <RotateCcw aria-hidden className="size-3.5 transition-transform duration-500 group-hover:-rotate-180" />
        No se envió · Reintentar
      </button>
    );
  }
  return (
    <span key={m.state} className="inline-flex items-center gap-1 text-[12px] text-ink-3 animate-fade-in">
      {m.state === "sending" ? <Loader2 aria-hidden className="size-3 animate-spin" /> : <Check aria-hidden className="size-3.5 text-success animate-pop-in" />}
      {m.state === "sending" ? "Enviando" : "Guardada"}
    </span>
  );
}

/** La pregunta de Criba se escribe palabra por palabra, como en un chat; con «reducir movimiento», entera. */
function Typed({ text }: { text: string }) {
  const { shown, done } = useTypewriter(text, 38);
  return (
    <span className={done ? undefined : "ai-caret"}>
      <CribaText text={shown} />
    </span>
  );
}
