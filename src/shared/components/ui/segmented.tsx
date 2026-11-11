"use client";

import { useLayoutEffect, useRef } from "react";
import { cn } from "@/shared/lib/cn";

export interface SegmentedProps<T extends string> {
  items: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  "aria-label": string;
  size?: "sm" | "md";
  className?: string;
}

/**
 * Control segmentado para filtros cortos (período, estado). Una píldora blanca
 * se desliza hasta la opción activa.
 */
export function Segmented<T extends string>({ items, value, onChange, size = "md", className, ...rest }: SegmentedProps<T>) {
  const root = useRef<HTMLDivElement>(null);
  const pill = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = root.current?.querySelector<HTMLElement>(`[data-value="${value}"]`);
    const p = pill.current;
    if (!el || !p) return;
    p.style.width = `${el.offsetWidth}px`;
    p.style.transform = `translateX(${el.offsetLeft}px)`;
    p.style.opacity = "1";
  }, [value, items]);

  return (
    <div ref={root} role="radiogroup" aria-label={rest["aria-label"]} className={cn("relative inline-flex items-center rounded-full bg-surface-2 p-1 ring-1 ring-border", className)}>
      <span
        ref={pill}
        aria-hidden
        className="absolute top-1 left-0 h-[calc(100%-8px)] rounded-full bg-surface opacity-0 shadow-[0_1px_2px_rgba(21,32,27,0.08),0_4px_12px_-6px_rgba(21,32,27,0.25)] ring-1 ring-border/60 transition-[transform,width] duration-500 ease-[var(--ease-spring)]"
      />
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            data-value={item.value}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative z-10 flex items-center gap-1.5 rounded-full whitespace-nowrap transition-colors duration-300",
              size === "sm" ? "h-8 px-3 text-[13px]" : "h-9 px-4 text-[13.5px]",
              active ? "font-medium text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined ? <span className={cn("font-mono text-[11px]", active ? "text-ink-2" : "text-ink-3")}>{item.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
