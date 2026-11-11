import { cn } from "@/shared/lib/cn";

export interface LogoProps {
  /** Oculta el nombre y deja solo la marca. */
  compact?: boolean;
  /** Para fondos oscuros. */
  inverse?: boolean;
  /** lg para la barra superior de la app. */
  size?: "md" | "lg";
  className?: string;
}

const dots = [1, 1, 1, 1, 1, 1, 0.4, 1, 0.4];

/** Marca de Criba: rejilla 3×3 de puntos que "criba" la última fila. */
export function Logo({ compact = false, inverse = false, size = "md", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-[9px]", className)} aria-label="Criba">
      <span
        aria-hidden
        className={cn("grid grid-cols-3", size === "lg" ? "size-8 gap-1 rounded-[9px] p-[7px]" : "size-[26px] gap-[3px] rounded-[7px] px-[5px] py-1.5", inverse ? "bg-surface" : "bg-ink")}
      >
        {dots.map((opacity, i) => (
          <span
            key={i}
            className={cn("rounded-full", size === "lg" ? "size-1" : "size-[3px]", inverse ? "bg-ink" : "bg-surface")}
            style={{ opacity }}
          />
        ))}
      </span>
      {compact ? null : (
        <span className={cn("font-head font-semibold tracking-tight", size === "lg" ? "text-[21px]" : "text-lg", inverse ? "text-ink-inverse" : "text-ink")}>Criba</span>
      )}
    </span>
  );
}
