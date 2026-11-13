import { cn } from "@/shared/lib/cn";
import type { CribaMood } from "@/shared/lib/criba-work";

/**
 * Qué está haciendo Criba AI. Solo se mueven los ojos, y cada estado se ve
 * distinto: en reposo parpadea y mira de reojo; al leer recorre líneas; al
 * comparar mira hacia arriba, pensando; al escribir asiente; al terminar sonríe.
 */
export type { CribaMood };

const LABEL: Record<CribaMood, string> = {
  idle: "Criba AI",
  reading: "Criba AI está leyendo",
  thinking: "Criba AI está comparando",
  talking: "Criba AI está escribiendo",
  done: "Criba AI terminó",
};

export interface CribaCharacterProps {
  mood?: CribaMood;
  /** Alto en px; el ancho sale de la proporción de la hoja. */
  size?: number;
  /** Para fondos oscuros: hoja clara con ojos de tinta. */
  inverse?: boolean;
  /** Si se anuncia a lectores de pantalla. Por defecto es decorativo. */
  announce?: boolean;
  className?: string;
}

/**
 * El personaje de Criba AI: la hoja de la marca, con ojos y nada más. Aparece donde
 * la IA actúa (leer, evaluar, entrevistar) y nunca donde decide una persona.
 * Solo SVG y CSS (globals.css, `.criba-char`); respeta prefers-reduced-motion.
 */
export function CribaCharacter({ mood = "idle", size = 40, inverse = false, announce = false, className }: CribaCharacterProps) {
  const page = inverse ? "#f5f1e8" : "var(--ink)";
  const fold = inverse ? "#d9d2c3" : "color-mix(in oklab, var(--ink) 72%, var(--ink-inverse))";
  const eye = inverse ? "#15201b" : "var(--ink-inverse)";
  return (
    <svg
      viewBox="0 0 24 28"
      width={(size * 24) / 28}
      height={size}
      data-mood={mood}
      className={cn("criba-char shrink-0 overflow-visible", className)}
      role={announce ? "img" : undefined}
      aria-label={announce ? LABEL[mood] : undefined}
      aria-hidden={announce ? undefined : true}
    >
      <g className="criba-char__body">
        <path d="M4 1h11.2L22 7.8V24a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Z" fill={page} />
        <path d="M15.2 1v4.3a2.5 2.5 0 0 0 2.5 2.5H22" fill={fold} />
        <g className="criba-char__eyes">
          {mood === "done" ? (
            <g fill="none" stroke={eye} strokeWidth="1.7" strokeLinecap="round">
              <path d="M6.6 15.6q2-2.6 4 0" />
              <path d="M13.4 15.6q2-2.6 4 0" />
            </g>
          ) : (
            <g fill={eye}>
              <ellipse className="criba-char__eye" cx="8.6" cy="15" rx="1.9" ry="2.5" />
              <ellipse className="criba-char__eye" cx="15.4" cy="15" rx="1.9" ry="2.5" />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}
