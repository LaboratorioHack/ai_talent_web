"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Field, inputBorderClass } from "./field";

export interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  kind?: string;
  help?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Solo acepta cifras dentro del rango; los botones − / + suman el paso. */
export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  kind,
  help = "Solo cifras",
  error,
  disabled,
  className,
}: NumberFieldProps) {
  const kindLabel = kind ?? (max !== Number.MAX_SAFE_INTEGER ? `${min} a ${max}` : undefined);
  const set = (n: number) => onChange(clamp(n, min, max));

  return (
    <Field label={label} kind={kindLabel} help={help} error={error} className={className}>
      {({ id, describedBy }) => (
        <div
          className={cn("field-box flex h-11 w-full items-stretch overflow-hidden", inputBorderClass(Boolean(error)), disabled && "opacity-45")}
        >
          <button
            type="button"
            aria-label="Restar"
            disabled={disabled || value <= min}
            onClick={() => set(value - step)}
            className="flex w-11 shrink-0 items-center justify-center text-ink-2 transition-colors duration-300 hover:bg-surface-2 hover:text-ink disabled:opacity-35"
          >
            <Minus aria-hidden className="size-3.5" />
          </button>
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            step={step}
            value={value}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (!Number.isNaN(next)) set(next);
            }}
            className="min-w-0 flex-1 border-x border-border bg-transparent text-center font-mono text-[14px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            type="button"
            aria-label="Sumar"
            disabled={disabled || value >= max}
            onClick={() => set(value + step)}
            className="flex w-11 shrink-0 items-center justify-center text-ink-2 transition-colors duration-300 hover:bg-surface-2 hover:text-ink disabled:opacity-35"
          >
            <Plus aria-hidden className="size-3.5" />
          </button>
        </div>
      )}
    </Field>
  );
}
