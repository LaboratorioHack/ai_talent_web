"use client";

import { useCallback, useRef, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { useDismiss } from "@/shared/hooks/use-dismiss";
import { usePresence } from "@/shared/hooks/use-presence";
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
  kind,
  help,
  error,
  disabled,
  className,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);
  const { mounted, state } = usePresence(open, 160);

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
            data-open={open} className={cn(inputBoxClass, inputBorderClass(Boolean(error)), "justify-between text-left", disabled && "opacity-45")}
          >
            <span className={cn(!value && "text-ink-3")}>{value ? formatDateDisplay(value) : placeholder}</span>
            <CalendarIcon aria-hidden className={cn("size-[15px] shrink-0 transition-colors duration-300", open ? "text-ink" : "text-ink-3")} />
          </button>
          {mounted ? (
            <div
              role="dialog"
              aria-label={label}
              data-state={state}
              className="absolute top-[calc(100%+6px)] left-0 z-30 origin-top-left rounded-lg shadow-[0_18px_40px_-20px_rgba(21,32,27,0.45)] data-[state=closed]:animate-[menu-out_160ms_var(--ease-in-out-soft)_both] data-[state=open]:animate-[menu-in_240ms_var(--ease-out-soft)_both]"
            >
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
