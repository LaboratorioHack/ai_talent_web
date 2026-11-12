import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

export interface KpiCardProps {
  label: string;
  value: number;
  detail: string;
  icon: LucideIcon;
  /** Solo para cifras que son un resultado (cumplen, entrevistas). */
  tone?: "default" | "success" | "warning" | "blue";
  index?: number;
}

const toneClass = { default: "text-ink", success: "text-success", warning: "text-warning", blue: "text-blue" } as const;
const iconTone = { default: "bg-surface-2 text-ink-2", success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning", blue: "bg-blue-soft text-blue" } as const;

/** Una cifra con contexto. La cifra cuenta hasta su valor cuando cambia el filtro. */
export function KpiCard({ label, value, detail, icon: Icon, tone = "default", index = 0 }: KpiCardProps) {
  return (
    <div className="card group flex flex-col gap-4 px-5 py-5 transition-[transform,translate,scale,rotate,box-shadow] duration-500 ease-[var(--ease-out-soft)] animate-rise hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(21,32,27,0.45)]" style={{ animationDelay: `${index * 70}ms` }}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-ink-2">{label}</span>
        <span className={cn("flex size-8 items-center justify-center rounded-lg transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-110", iconTone[tone])}>
          <Icon aria-hidden className="size-4" />
        </span>
      </div>
      <AnimatedNumber value={value} className={cn("font-head text-[38px] leading-none font-semibold tracking-[-0.02em] tabular-nums", toneClass[tone])} />
      <span className="text-[12.5px] text-ink-3">{detail}</span>
    </div>
  );
}
