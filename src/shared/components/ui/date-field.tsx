"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatDateDisplay } from "@/shared/lib/dates";
import { Calendar } from "./calendar";
import { Field, inputBorderClass, inputBoxClass } from "./field";

export interface DateFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  kind?: string;
  help?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/** Campo de fecha: abre el calendario en un popover; no se puede escribir. */
export function DateField({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Elegir fecha",
  kind = "Elegir fecha",
  help,
  error,
  disabled,
  className,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <Field label={label} kind={kind} help={help} error={error} className={className}>
      {({ id, describedBy }) => (
        <div ref={rootRef} className="relative">
          <button
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-describedby={describedBy}
            onClick={() => setOpen((o) => !o)}
            className={cn(inputBoxClass, inputBorderClass(Boolean(error)), "justify-between text-left", disabled && "opacity-45")}
          >
            <span className={cn(!value && "text-ink-3")}>{value ? formatDateDisplay(value) : placeholder}</span>
            <CalendarIcon aria-hidden className="size-[15px] shrink-0 text-ink-3" />
          </button>
          {open ? (
            <div role="dialog" aria-label={label} className="absolute top-[calc(100%+6px)] left-0 z-30 shadow-lg animate-pop-in">
              <Calendar
                value={value}
                minDate={minDate}
                maxDate={maxDate}
                onChange={(d) => {
                  onChange(d);
                  setOpen(false);
                }}
              />
            </div>
          ) : null}
        </div>
      )}
    </Field>
  );
}
