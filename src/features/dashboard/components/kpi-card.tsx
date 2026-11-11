import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface KpiCardProps {
  label: string;
  value: string | number;
  detail: string;
  icon: LucideIcon;
  /** Solo para cifras que son un resultado (cumplen, entrevistas). */
  tone?: "default" | "success" | "warning" | "blue";
  index?: number;
}

const toneClass = { default: "text-ink", success: "text-success", warning: "text-warning", blue: "text-blue" } as const;

/** Una cifra con contexto. La cifra es el titular; el detalle dice por qué importa. */
export function KpiCard({ label, value, detail, icon: Icon, tone = "default", index = 0 }: KpiCardProps) {
  return (
    <div className="card flex flex-col gap-3 px-5 py-4 animate-rise" style={{ animationDelay: `${index * 70}ms` }}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-ink-2">{label}</span>
        <Icon aria-hidden className={cn("size-4", toneClass[tone])} />
      </div>
      <span className={cn("font-head text-[34px] leading-none font-semibold tabular-nums", toneClass[tone])}>{value}</span>
      <span className="text-[12.5px] text-ink-3">{detail}</span>
    </div>
  );
}
