"use client";

import { cn } from "@/shared/lib/cn";

export interface TabItem<T extends string = string> {
  value: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string> {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

/** Pestañas para vistas hermanas. La activa se marca con tinta y subrayado. */
export function Tabs<T extends string>({ items, value, onChange, className, ...rest }: TabsProps<T>) {
  return (
    <div role="tablist" aria-label={rest["aria-label"]} className={cn("flex gap-1 border-b border-border", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "-mb-px px-3 py-2.5 text-sm whitespace-nowrap transition-colors duration-300",
              active ? "border-b-2 border-ink font-semibold text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined ? <span className="ml-1.5 rounded-full bg-surface-2 px-1.5 py-px font-mono text-[11px] text-ink-2">{item.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
