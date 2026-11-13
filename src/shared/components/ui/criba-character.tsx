import { cn } from "@/shared/lib/cn";
import type { CribaMood } from "@/shared/lib/criba-work";

/**
 * Qué está haciendo Criba AI. Cada estado se ve distinto, para que se entienda
 * sin leer: parpadea en reposo, baja la franja ámbar al leer, mira a los lados
 * al comparar, mueve el resaltador al hablar y sonríe al terminar.
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
 * El personaje de Criba AI: la misma hoja de la marca, con ojos. Aparece donde
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
            <g fill="none" stroke={eye} strokeWidth="1.5" strokeLinecap="round">
              <path d="M5.6 9.6q1.5-1.8 3 0" />
              <path d="M11.4 9.6q1.5-1.8 3 0" />
            </g>
          ) : (
            <g fill={eye}>
              <ellipse className="criba-char__eye" cx="7.1" cy="9" rx="1.35" ry="1.7" />
              <ellipse className="criba-char__eye" cx="12.9" cy="9" rx="1.35" ry="1.7" />
            </g>
          )}
        </g>
        <g className="criba-char__marker">
          <rect x="3.6" y="14.6" width="15.2" height="4.4" rx="1.3" fill="#f2a93b" />
          <rect x="5" y="15.8" width="12" height="2" rx="1" fill="#15201b" />
        </g>
        <rect className="criba-char__line" x="5" y="21.2" width="7" height="2" rx="1" fill={eye} opacity="0.5" />
      </g>
    </svg>
  );
}
