import { Tooltip } from "@/shared/components/ui";

export interface FunnelChartProps {
  steps: { label: string; value: number }[];
}

/**
 * Embudo de la semana: una sola serie, un solo tono (la tinta), columnas que
 * crecen desde la base. La cifra va encima de cada columna; el tooltip añade
 * qué porcentaje del paso anterior sigue.
 */
export function FunnelChart({ steps }: FunnelChartProps) {
  const max = Math.max(...steps.map((s) => s.value), 1);
  return (
    <figure className="flex flex-col gap-3" aria-label="Embudo de esta semana">
      <div className="flex h-[150px] items-end gap-3">
        {steps.map((s, i) => {
          const prev = i > 0 ? steps[i - 1].value : null;
          const pct = prev ? Math.round((s.value / prev) * 100) : null;
          return (
            <Tooltip
              key={s.label}
              className="h-full flex-1"
              content={
                <>
                  <strong className="font-semibold">
                    {s.label}: {s.value}
                  </strong>
                  {pct !== null ? <span className="block opacity-70">{pct} % del paso anterior</span> : null}
                </>
              }
            >
              <button type="button" className="flex h-full w-full flex-col items-start justify-end gap-1.5 rounded-md text-left focus-visible:outline-offset-4" aria-label={`${s.label}: ${s.value}`}>
                <span className="font-head text-[17px] leading-none font-semibold tabular-nums">{s.value}</span>
                <span
                  className="grow-y block w-12 rounded-t-[4px] rounded-b-[2px] bg-ink transition-opacity duration-300 group-hover/tip:opacity-80"
                  style={{ height: `${Math.max(4, (s.value / max) * 112)}px`, opacity: 1 - i * 0.14, animationDelay: `${200 + i * 90}ms` }}
                />
              </button>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex gap-3">
        {steps.map((s) => (
          <span key={s.label} className="flex-1 text-[12px] text-ink-2">
            {s.label}
          </span>
        ))}
      </div>
    </figure>
  );
}
