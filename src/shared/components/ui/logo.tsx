import { cn } from "@/shared/lib/cn";

export interface LogoProps {
  /** Oculta el nombre y deja solo la marca. */
  compact?: boolean;
  /** Para fondos oscuros. */
  inverse?: boolean;
  className?: string;
}

const dots = [1, 1, 1, 1, 1, 1, 0.4, 1, 0.4];

/** Marca de Criba: rejilla 3×3 de puntos que "criba" la última fila. */
export function Logo({ compact = false, inverse = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-[9px]", className)} aria-label="Criba">
      <span
        aria-hidden
        className={cn("grid size-[26px] grid-cols-3 gap-[3px] rounded-[7px] px-[5px] py-1.5", inverse ? "bg-ink" : "bg-amber")}
      >
        {dots.map((opacity, i) => (
          <span
            key={i}
            className={cn("size-[3px] rounded-full", inverse ? "bg-bg" : "bg-ink-inverse")}
            style={{ opacity }}
          />
        ))}
      </span>
      {compact ? null : (
        <span className={cn("font-head text-lg font-semibold tracking-tight", inverse ? "text-ink-inverse" : "text-ink")}>Criba</span>
      )}
    </span>
  );
}
