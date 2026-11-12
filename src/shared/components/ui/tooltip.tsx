import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface TooltipProps {
  /** Contenido del globo. */
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Globo de ayuda solo con CSS: aparece al pasar el ratón o al enfocar (teclado).
 * El disparador debe ser enfocable si la información no está en otro lado.
 */
export function Tooltip({ content, children, side = "top", className, style }: TooltipProps) {
  return (
    <span className={cn("group/tip relative inline-flex", className)} style={style}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-40 w-max max-w-[240px] -translate-x-1/2 rounded-lg bg-panel px-3 py-2 text-left text-[12px] leading-snug text-ink-inverse shadow-[0_12px_30px_-12px_rgba(21,32,27,0.6)]",
          "opacity-0 transition-[opacity,translate] duration-200 ease-[var(--ease-out-soft)] group-focus-within/tip:opacity-100 group-hover/tip:opacity-100",
          side === "top" ? "bottom-[calc(100%+8px)] translate-y-1 group-focus-within/tip:translate-y-0 group-hover/tip:translate-y-0" : "top-[calc(100%+8px)] -translate-y-1 group-focus-within/tip:translate-y-0 group-hover/tip:translate-y-0",
        )}
      >
        {content}
      </span>
    </span>
  );
}
