"use client";

import { useState } from "react";
import { cn } from "@/shared/lib/cn";
import type { RequirementResult } from "@/shared/types/domain";
import type { RankRequirement } from "../types/ranking";

export interface CompositionBarProps {
  score: number;
  requirements: RankRequirement[];
  results: RequirementResult[];
}

/**
 * De dónde sale el puntaje: un tramo por requisito con su aporte centrado
 * dentro. Verde si cumple, ámbar si cuenta a medias; lo que falta para 100
 * queda en gris. Al pasar el ratón, el globo dice requisito, aporte y peso.
 */
export function CompositionBar({ score, requirements, results }: CompositionBarProps) {
  const [hover, setHover] = useState<string | null>(null);
  const parts = requirements
    .filter((r) => r.type !== "DISQUALIFYING")
    .map((r) => ({ req: r, res: results.find((x) => x.requirementId === r.id) }))
    .filter((p) => (p.res?.score ?? 0) > 0);
  // Lo que le falta para 100, con un decimal como el puntaje.
  const missing = Math.max(0, Math.round((100 - score) * 10) / 10);

  return (
    <figure className="flex flex-col gap-2.5">
      <figcaption className="flex items-baseline justify-between text-[13px]">
        <span className="font-medium">De dónde sale el {score}</span>
        <span className="text-ink-3">{score} de 100 posibles</span>
      </figcaption>
      <div className="flex h-9 gap-[2px]">
        {parts.map(({ req, res }, i) => {
          const pts = res?.score ?? 0;
          const partial = res?.result === "PARTIAL";
          return (
            <span
              key={`${req.id}-${pts}`}
              tabIndex={0}
              role="img"
              aria-label={`${req.description}: ${pts} puntos de ${req.weight}`}
              onPointerEnter={() => setHover(req.id)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(req.id)}
              onBlur={() => setHover(null)}
              className={cn(
                "grow-x relative flex items-center justify-center rounded-[5px] font-mono text-[12px] font-semibold transition-[opacity,filter] duration-300 outline-offset-2",
                partial ? "bg-amber text-ink" : "bg-success text-ink-inverse",
                hover && hover !== req.id && "opacity-45",
              )}
              style={{ width: `${pts}%`, animationDelay: `${120 + i * 70}ms` }}
            >
              {pts >= 5 ? pts : null}
              {hover === req.id ? (
                <span role="tooltip" className="absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-tip px-3 py-2 text-left font-sans text-[12px] leading-snug font-normal text-tip-ink shadow-[0_12px_30px_-12px_rgba(21,32,27,0.6)] animate-[fade-in_160ms_ease-out]">
                  <strong className="block font-semibold">{req.description}</strong>
                  <span className="opacity-75">
                    Aporta {pts} de {req.weight} puntos{partial ? ", cuenta a medias" : ""}
                  </span>
                </span>
              ) : null}
            </span>
          );
        })}
        {missing > 0 ? (
          <span className="flex items-center justify-center rounded-[5px] bg-[repeating-linear-gradient(135deg,var(--surface-2)_0_6px,var(--surface-3)_6px_8px)] font-mono text-[12px] text-ink-3" style={{ width: `${missing}%` }}>
            {missing >= 6 ? missing : null}
          </span>
        ) : null}
      </div>
      <div className="flex gap-[2px] text-[11.5px] text-ink-3">
        {parts.map(({ req, res }) => (
          <span key={req.id} className={cn("truncate transition-colors", hover === req.id && "text-ink")} style={{ width: `${res?.score ?? 0}%` }}>
            {(res?.score ?? 0) >= 7 ? req.description.split(/[ (,]/)[0] : ""}
          </span>
        ))}
        {missing > 0 ? (
          <span className="truncate" style={{ width: `${missing}%` }}>
            {missing >= 7 ? "Falta" : ""}
          </span>
        ) : null}
      </div>
    </figure>
  );
}
