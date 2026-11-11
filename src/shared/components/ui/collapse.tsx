import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface CollapseProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Muestra u oculta contenido cambiando su alto con transición (grid 0fr a 1fr),
 * para que lo que aparece (un error, un aviso) empuje el resto con suavidad
 * en vez de moverlo de golpe.
 */
export function Collapse({ open, children, className }: CollapseProps) {
  return (
    <div
      aria-hidden={!open || undefined}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-soft)]",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}
