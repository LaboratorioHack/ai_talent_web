import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  /** Acción principal (Botón Tinta). */
  action?: ReactNode;
  /** Alternativa en texto azul: "o conectar Greenhouse / Lever". */
  alternative?: ReactNode;
  className?: string;
}

/** Los vacíos siempre proponen el siguiente paso y quedan centrados en el espacio libre. */
export function EmptyState({ title, description, icon: Icon = Inbox, action, alternative, className }: EmptyStateProps) {
  return (
    <div className={cn("mx-auto my-auto flex w-full max-w-[520px] flex-col items-center gap-3.5 self-center rounded-2xl border border-border bg-surface px-8 py-12 text-center", className)}>
      <Icon aria-hidden className="size-7 text-ink-3" />
      <h3 className="font-head text-[21px] font-semibold">{title}</h3>
      {description ? <p className="max-w-[300px] text-sm text-ink-2">{description}</p> : null}
      {action}
      {alternative ? <div className="text-[12.5px] text-blue">{alternative}</div> : null}
    </div>
  );
}
