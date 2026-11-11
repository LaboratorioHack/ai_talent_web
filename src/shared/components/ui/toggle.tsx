"use client";

import { useId } from "react";
import { cn } from "@/shared/lib/cn";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/** Interruptor para opciones binarias. */
export function Toggle({ checked, onChange, label, description, disabled, className }: ToggleProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("flex cursor-pointer items-start gap-3", disabled && "cursor-not-allowed opacity-60", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-px h-[22px] w-10 shrink-0 rounded-full p-0.5 transition-colors duration-300",
          checked ? "bg-amber" : "bg-border-strong",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "block size-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[var(--ease-spring)]",
            checked ? "translate-x-[18px]" : "translate-x-0",
          )}
        />
      </button>
      <span className="flex flex-col gap-0.5">
        <span className="text-[13.5px] text-ink">{label}</span>
        {description ? <span className="text-xs text-ink-2">{description}</span> : null}
      </span>
    </label>
  );
}
