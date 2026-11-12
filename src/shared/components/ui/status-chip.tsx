import type { ReactNode } from "react";
import { Check, CircleDashed, Loader2, Minus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Tres resultados posibles y dos estados de proceso (+ descartado).
 * Siempre texto + color, nunca solo color.
 */
export type EvaluationStatus =
  | "meets"
  | "partial"
  | "does_not_meet"
  | "evaluating"
  | "unevaluated"
  | "discarded";

interface ChipStyle {
  label: string;
  icon: LucideIcon;
  className: string;
}

export const STATUS_CHIP: Record<EvaluationStatus, ChipStyle> = {
  meets: { label: "Cumple", icon: Check, className: "bg-success-soft text-success" },
  partial: { label: "Cumple parcialmente", icon: Minus, className: "bg-warning-soft text-warning" },
  does_not_meet: { label: "No cumple", icon: X, className: "bg-danger-soft text-danger" },
  evaluating: { label: "En evaluación", icon: Loader2, className: "bg-blue-soft text-blue" },
  unevaluated: { label: "Sin evaluar", icon: CircleDashed, className: "bg-surface-2 text-ink-2" },
  discarded: { label: "Descartado", icon: X, className: "bg-surface-2 text-ink-3" },
};

export interface StatusChipProps {
  status: EvaluationStatus;
  /** Reemplaza la etiqueta por defecto, p. ej. "Cumple · 4 de 4 obligatorios". */
  children?: ReactNode;
  size?: "sm" | "md";
  className?: string;
}

export function StatusChip({ status, children, size = "md", className }: StatusChipProps) {
  const { label, icon: Icon, className: tone } = STATUS_CHIP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        size === "md" ? "gap-1.5 py-[5px] pr-2.5 pl-2 text-[12.5px]" : "gap-1 py-[3px] pr-2 pl-1.5 text-xs",
        tone,
        className,
      )}
    >
      <Icon
        aria-hidden
        className={cn(size === "md" ? "size-3" : "size-2.5", status === "evaluating" && "animate-spin")}
      />
      {children ?? label}
    </span>
  );
}
