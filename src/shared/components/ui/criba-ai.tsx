import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { LogoMark } from "./logo";

/**
 * Marca de Criba AI: dice dónde actúa la IA, sin tono de advertencia. Siempre
 * igual en toda la app (marca + nombre + qué hizo), para que se reconozca de un
 * vistazo en el portal de empresa y en el del postulante.
 */
export function CribaAi({ label, className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[linear-gradient(90deg,rgb(242_169_59/0.2),rgb(242_169_59/0.08))] py-[3px] pr-2.5 pl-1.5 text-[11.5px] font-semibold text-[color:var(--ai-ink)] ring-1 ring-amber/35",
        className,
      )}
    >
      <LogoMark size={13} />
      Criba AI
      {label ? <span className="font-normal opacity-80">· {label.charAt(0).toUpperCase() + label.slice(1)}</span> : null}
    </span>
  );
}

/** Nota de una línea: qué hace Criba AI en esta pantalla. */
export function CribaAiNote({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-start gap-2.5 rounded-xl bg-amber/8 px-3.5 py-2.5 text-[13px] leading-snug text-ink-2 ring-1 ring-amber/20", className)}>
      <span className="mt-px">
        <CribaAi />
      </span>
      <span className="min-w-0">{children}</span>
    </p>
  );
}

/**
 * Texto donde Criba se nombra a sí misma: cada «Criba» o «Criba AI» lleva la
 * marca de la página al lado, para que se reconozca de un vistazo. Solo texto:
 * nada se interpreta como HTML.
 */
export function CribaText({ text }: { text: string }) {
  const parts = text.split(/(\bCriba(?: AI)?\b)/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span key={i} className="inline-flex items-baseline gap-[0.3em] font-medium whitespace-nowrap">
            <LogoMark size={12} className="translate-y-[1px] self-center" />
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}
