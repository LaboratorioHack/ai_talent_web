"use client";

import { Fragment, useEffect, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { ArrowUp, RotateCcw, X } from "lucide-react";
import { CribaCharacter, CribaText, LogoMark, type CribaMood } from "@/shared/components/ui";
import { useTypewriter } from "@/shared/hooks/use-typewriter";
import { cn } from "@/shared/lib/cn";
import { startCribaWork } from "@/shared/lib/criba-work";
import { askCriba, type AssistantAudience, type ChatTurn } from "../api/assistant";

const COPY: Record<AssistantAudience, { greeting: string; hint: string; suggestions: string[] }> = {
  company: {
    greeting: "¡Hola! Soy Criba AI y estoy aquí para echarte una mano. Puedo explicarte el ranking, mostrarte la evidencia de una persona o ayudarte a pensar qué validar en la entrevista. ¿Por dónde empezamos?",
    hint: "Sobre tus vacantes y candidatos",
    suggestions: ["¿Quién encaja mejor en esta vacante?", "¿Qué falta validar en la entrevista?", "Resume cómo van mis vacantes"],
  },
  applicant: {
    greeting: "¡Hola! Soy Criba AI, qué bueno verte por aquí. Puedo contarte en qué va tu postulación, qué leí de tu hoja de vida o ayudarte a prepararte para lo que sigue. ¿Qué te gustaría saber?",
    hint: "Sobre tus postulaciones",
    suggestions: ["¿En qué va mi postulación?", "¿Qué vacantes me encajan?", "¿Cómo me preparo para la entrevista?"],
  },
};

const NUDGE_KEY = "criba-assistant-nudged";
const ERROR_REPLY = "Uy, esta vez no pude responderte. Seguro fue algo pasajero: ¿lo intentamos otra vez?";

/** Lo que se ve mientras Criba arma la respuesta, para que la espera no se sienta vacía. */
const THINKING: Record<AssistantAudience, string[]> = {
  company: ["Revisando tus vacantes", "Buscando la evidencia", "Armando la respuesta"],
  applicant: ["Revisando lo que tengo de ti", "Mirando tus postulaciones", "Armando la respuesta"],
};

interface Bubble extends ChatTurn {
  id: number;
  /** Respuesta que no entra al historial (p. ej. un error). */
  local?: boolean;
  /** Pregunta que se puede reenviar si la respuesta falló. */
  retry?: string;
}

/**
 * Criba AI en la esquina de cada portal. Al tocarla se despierta, saluda y
 * pregunta en qué ayuda; responde con lo que la persona puede ver (el API arma
 * el contexto según sea empresa o postulante). Nada aparece de golpe: piensa a
 * la vista y escribe la respuesta palabra por palabra.
 */
export function CribaAssistant({ audience }: { audience: AssistantAudience }) {
  const copy = COPY[audience];
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState("");
  const [waiting, setWaiting] = useState(false);
  const [typing, setTyping] = useState(false);
  const [step, setStep] = useState(0);
  const nextId = useRef(1);
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Una sola vez por sesión, un globo discreto avisa que Criba está para ayudar.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(NUDGE_KEY) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    const show = window.setTimeout(() => setNudge(true), 4000);
    const hide = window.setTimeout(() => setNudge(false), 11000);
    try {
      sessionStorage.setItem(NUDGE_KEY, "1");
    } catch {
      // Sin almacenamiento el globo simplemente no se repite en esta pestaña.
    }
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles.length, waiting]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const focus = window.setTimeout(() => inputRef.current?.focus(), 250);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(focus);
    };
  }, [open]);

  // Mientras piensa, el texto de espera cambia cada tanto.
  useEffect(() => {
    if (!waiting) return;
    const t = window.setInterval(() => setStep((n) => n + 1), 2200);
    return () => {
      window.clearInterval(t);
      setStep(0);
    };
  }, [waiting]);

  function push(role: ChatTurn["role"], content: string, local = false, retry?: string) {
    const id = nextId.current++;
    setBubbles((b) => [...b, { id, role, content, local, retry }]);
    if (role === "assistant") setTyping(true);
  }

  function toggle() {
    setNudge(false);
    // La primera vez, Criba se presenta (el saludo también se escribe).
    if (!open && bubbles.length === 0) push("assistant", copy.greeting);
    setOpen((o) => !o);
  }

  async function send(text: string, again = false) {
    const question = text.trim();
    if (!question || waiting) return;
    // Al reintentar, la pregunta ya está en pantalla: se quita el aviso de error y no se repite la burbuja.
    const kept = again ? bubbles.filter((b) => !b.retry) : bubbles;
    if (again) setBubbles(kept);
    else setDraft("");
    const history: ChatTurn[] = kept.filter((b) => !b.local).map(({ role, content }) => ({ role, content }));
    if (!again) {
      history.push({ role: "user", content: question });
      push("user", question);
    }
    setWaiting(true);
    const done = startCribaWork("Responde tu pregunta");
    try {
      // El saludo es de la interfaz, no de la IA: la conversación que se envía empieza en la persona.
      const firstUser = history.findIndex((t) => t.role === "user");
      push("assistant", await askCriba(audience, history.slice(firstUser)));
    } catch {
      push("assistant", ERROR_REPLY, true, question);
    } finally {
      done();
      setWaiting(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(draft);
  }

  function onKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send(draft);
    }
  }

  const mood: CribaMood = waiting ? "thinking" : typing ? "talking" : "idle";
  const lastId = bubbles.at(-1)?.id;
  const onlyGreeting = bubbles.length === 1 && bubbles[0].role === "assistant";

  return (
    <>
      <section
        role="dialog"
        aria-label="Criba AI"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed right-4 bottom-24 z-50 flex h-[min(560px,calc(100dvh-8rem))] w-[min(380px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_30px_70px_-30px_rgba(21,32,27,0.55)] ring-1 ring-border sm:right-6",
          "transition-[opacity,transform,scale] duration-500 ease-[var(--ease-spring)]",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-90 opacity-0",
        )}
      >
        <header className="flex items-center gap-3 border-b border-border bg-[linear-gradient(180deg,rgb(242_169_59/0.12),transparent)] px-4 py-3.5">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-ink">
            <CribaCharacter mood={mood} size={26} inverse />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="font-head text-[15px] font-semibold">Criba AI</span>
            <span className="truncate text-[12px] text-ink-3">{waiting ? "Pensando…" : typing ? "Escribiendo…" : copy.hint}</span>
          </span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar Criba AI" className="flex size-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink">
            <X aria-hidden className="size-4" />
          </button>
        </header>

        <ol ref={listRef} aria-live="polite" className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4">
          {bubbles.map((b) => (
            <li
              key={b.id}
              className={cn(
                "flex items-end gap-2",
                b.role === "user" ? "justify-end animate-[bubble-out_380ms_var(--ease-spring)_both]" : "justify-start animate-[bubble-in_420ms_var(--ease-out-soft)_both]",
              )}
            >
              {b.role === "assistant" ? (
                <span aria-hidden className="mb-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border">
                  <LogoMark size={12} />
                </span>
              ) : null}
              <div className={cn("flex max-w-[85%] flex-col gap-1.5", b.role === "user" ? "items-end" : "items-start")}>
                <p
                  className={cn(
                    "rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed",
                    b.role === "user" ? "rounded-br-md bg-ink text-ink-inverse" : "rounded-bl-md bg-surface-2 text-ink",
                    b.local && "bg-danger/8 ring-1 ring-danger/25",
                  )}
                >
                  {b.role === "assistant" && b.id === lastId ? <Typed text={b.content} onDone={() => setTyping(false)} /> : b.role === "assistant" ? <Reply text={b.content} /> : b.content}
                </p>
                {b.retry ? (
                  <button
                    type="button"
                    onClick={() => void send(b.retry!, true)}
                    disabled={waiting}
                    className="group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12.5px] text-ink-2 ring-1 ring-border transition-[color,box-shadow,scale] duration-300 animate-[option-in_360ms_var(--ease-out-soft)_400ms_both] hover:text-ink hover:ring-amber/60 active:scale-95"
                  >
                    <RotateCcw aria-hidden className="size-3.5 transition-transform duration-500 group-hover:-rotate-180" />
                    Reintentar
                  </button>
                ) : null}
              </div>
            </li>
          ))}
          {waiting ? (
            <li className="flex items-end gap-2 animate-[bubble-in_360ms_var(--ease-out-soft)_both]" aria-label="Criba AI está pensando">
              <span aria-hidden className="mb-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 ring-1 ring-border">
                <CribaCharacter mood="thinking" size={13} />
              </span>
              <span className="flex flex-col gap-1">
                <span className="flex w-fit gap-1 rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="typing-dot size-1.5 rounded-full bg-ink-3" style={{ animationDelay: `${d * 140}ms` }} />
                  ))}
                </span>
                <span key={step} className="animate-fade-in text-[12px] text-ink-3">
                  {THINKING[audience][step % THINKING[audience].length]}…
                </span>
              </span>
            </li>
          ) : null}
          {onlyGreeting && !typing ? (
            <li className="flex flex-col items-start gap-2 pt-1">
              {copy.suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s)}
                  className="rounded-full px-3 py-1.5 text-left text-[12.5px] text-ink-2 ring-1 ring-border transition-[color,box-shadow,transform] duration-300 animate-[option-in_360ms_var(--ease-out-soft)_both] hover:-translate-y-px hover:text-ink hover:ring-amber/60"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  {s}
                </button>
              ))}
            </li>
          ) : null}
        </ol>

        <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-border p-3">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            maxLength={2000}
            placeholder="Escribe tu pregunta"
            aria-label="Tu pregunta para Criba AI"
            className="field-box max-h-28 min-h-10 flex-1 resize-none px-3.5 py-2.5 text-[13.5px] leading-snug"
          />
          <button
            type="submit"
            disabled={!draft.trim() || waiting}
            aria-label="Enviar pregunta"
            className={cn(
              "group flex size-10 shrink-0 items-center justify-center rounded-full transition-[opacity,background-color,color,scale] duration-300 ease-[var(--ease-spring)] hover:scale-105 active:scale-90 disabled:opacity-35 disabled:hover:scale-100",
              draft.trim() && !waiting ? "bg-amber text-[#1a211d]" : "bg-ink text-ink-inverse",
            )}
          >
            <ArrowUp aria-hidden className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
          </button>
        </form>
      </section>

      {/* El contenedor no recibe clics: el globo oculto ocupaba espacio y tapaba los botones de debajo. */}
      <div className="pointer-events-none fixed right-4 bottom-6 z-50 flex items-center gap-3 sm:right-6">
        <span
          aria-hidden={!nudge}
          className={cn(
            "rounded-2xl rounded-br-md bg-surface px-3.5 py-2 text-[13px] shadow-[0_14px_30px_-16px_rgba(21,32,27,0.5)] ring-1 ring-border transition-[opacity,transform] duration-500 ease-[var(--ease-out-soft)]",
            nudge && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0",
          )}
        >
          ¿Te ayudo con algo?
        </span>
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-label={open ? "Cerrar Criba AI" : "Abrir Criba AI"}
          className={cn(
            "group pointer-events-auto relative flex size-14 items-center justify-center rounded-full bg-ink shadow-[0_18px_40px_-14px_rgba(21,32,27,0.7)] ring-2 ring-amber/50 transition-transform duration-500 ease-[var(--ease-spring)] hover:scale-105 active:scale-95",
            open && "rotate-[-6deg]",
          )}
        >
          {nudge && !open ? <span aria-hidden className="absolute inset-0 rounded-full ring-2 ring-amber/70 animate-ping" /> : null}
          <CribaCharacter mood={open ? mood : nudge ? "talking" : "idle"} size={30} inverse />
        </button>
      </div>
    </>
  );
}

/** La respuesta de Criba se escribe palabra por palabra. */
function Typed({ text, onDone }: { text: string; onDone: () => void }) {
  const { shown, done } = useTypewriter(text, 34);
  useEffect(() => {
    if (done) onDone();
  }, [done, onDone]);
  return (
    <>
      <Reply text={shown} />
      {done ? null : <span aria-hidden className="ai-caret" />}
    </>
  );
}

/** **negrita** dentro de una línea. Solo texto: nada del modelo se interpreta como HTML. */
function inline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith("**") && part.endsWith("**") && part.length > 4 ? <strong key={i} className="font-semibold"><CribaText text={part.slice(2, -2)} /></strong> : <Fragment key={i}><CribaText text={part.replace(/\*\*/g, "")} /></Fragment>));
}

/** Lo que escribe Criba, legible: párrafos, listas con guion y negritas; el resto, texto plano. */
function Reply({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let items: string[] = [];
  const flush = () => {
    if (!items.length) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="my-1 flex list-disc flex-col gap-1 pl-4 marker:text-ink-3">
        {items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>,
    );
    items = [];
  };
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      items.push(bullet[1]);
      continue;
    }
    flush();
    if (line) blocks.push(<span key={`p-${blocks.length}`} className="block [&:not(:first-child)]:mt-1.5">{inline(line.replace(/^#+\s*/, ""))}</span>);
  }
  flush();
  return <>{blocks}</>;
}
