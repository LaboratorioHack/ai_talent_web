"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface FunnelChartProps {
  steps: { label: string; value: number; detail: string }[];
}

/**
 * Embudo: una sola serie en tinta, columnas centradas con la cifra encima y el
 * nombre debajo. Entre columnas, qué porcentaje pasa al siguiente paso. Al
 * pasar el ratón, la columna se resalta y el globo explica la cifra.
 */
export function FunnelChart({ steps }: FunnelChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...steps.map((s) => s.value), 1);
  const BAR = 150;

  return (
    <figure className="flex flex-col gap-3" aria-label="Embudo de selección">
      <div className="flex items-end">
        {steps.map((s, i) => {
          const next = steps[i + 1];
          const pass = next && s.value ? Math.round((next.value / s.value) * 100) : null;
          const h = Math.max(6, (s.value / max) * BAR);
          const dim = hover !== null && hover !== i;
          return (
            <div key={s.label} className="flex flex-1 items-end">
              <button
                type="button"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                aria-label={`${s.label}: ${s.value}. ${s.detail}`}
                className="relative flex flex-1 flex-col items-center gap-2 rounded-lg pt-1 outline-offset-4"
              >
                <span className={cn("font-head text-[22px] leading-none font-semibold tabular-nums transition-opacity duration-300", dim && "opacity-40")}>{s.value.toLocaleString("es-CO")}</span>
                <span
                  key={`${s.label}-${s.value}`}
                  className={cn("grow-y block w-full max-w-[84px] rounded-t-[6px] rounded-b-[2px] bg-ink transition-[opacity,transform] duration-300", dim && "opacity-25", hover === i && "scale-x-[1.04]")}
                  style={{ height: h, opacity: dim ? undefined : 1 - i * 0.13, animationDelay: `${120 + i * 80}ms` }}
                />
                {hover === i ? (
                  <span role="tooltip" className="absolute bottom-[calc(100%+6px)] left-1/2 z-20 w-max max-w-[220px] -translate-x-1/2 rounded-lg bg-panel px-3 py-2 text-left text-[12px] leading-snug text-ink-inverse shadow-[0_12px_30px_-12px_rgba(21,32,27,0.6)] animate-[fade-in_160ms_ease-out]">
                    <strong className="block font-semibold">
                      {s.value.toLocaleString("es-CO")} {s.label.toLowerCase()}
                    </strong>
                    <span className="opacity-75">{s.detail}</span>
                  </span>
                ) : null}
              </button>
              {pass !== null ? (
                <span className="flex w-14 self-center shrink-0 flex-col items-center gap-0.5 text-ink-3" aria-hidden>
                  <ChevronRight className="size-3.5" />
                  <span className="font-mono text-[11px]">{pass} %</span>
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="flex">
        {steps.map((s, i) => (
          <div key={s.label} className="flex flex-1">
            <span className={cn("flex-1 text-center text-[12.5px] transition-colors", hover === i ? "text-ink" : "text-ink-2")}>{s.label}</span>
            {i < steps.length - 1 ? <span className="w-14 shrink-0" /> : null}
          </div>
        ))}
      </div>
    </figure>
  );
}
