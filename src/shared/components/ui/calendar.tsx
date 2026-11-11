"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useToday } from "@/shared/hooks/use-today";
import { addMonths, formatMonthYear, isSameDay, monthGrid, startOfDay, WEEKDAYS_ES } from "@/shared/lib/dates";

export interface CalendarProps {
  value: Date | null;
  onChange: (date: Date) => void;
  /** Fechas anteriores no se pueden elegir. */
  minDate?: Date;
  maxDate?: Date;
  note?: string;
  className?: string;
}

/** Calendario mensual, semana que empieza en lunes. */
export function Calendar({ value, onChange, minDate, maxDate, note = "Las fechas pasadas no se pueden elegir", className }: CalendarProps) {
  const today = useToday();
  const [monthOverride, setMonth] = useState<Date | null>(null);
  const month = monthOverride ?? (value ? addMonths(value, 0) : today ? addMonths(today, 0) : null);
  const min = minDate ? startOfDay(minDate) : null;
  const max = maxDate ? startOfDay(maxDate) : null;

  const isDisabled = (d: Date) => (min !== null && d < min) || (max !== null && d > max);

  if (!month) return <div className={cn("h-[332px] w-[300px] rounded-lg border border-border bg-surface animate-breathe", className)} aria-busy />;

  return (
    <div className={cn("flex w-[300px] flex-col gap-3 rounded-lg border border-border bg-surface p-4", className)}>
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Mes anterior" onClick={() => setMonth(addMonths(month, -1))} className="rounded p-1 text-ink-2 hover:bg-surface-2">
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <span className="text-[13.5px] font-medium" aria-live="polite">
          {formatMonthYear(month)}
        </span>
        <button type="button" aria-label="Mes siguiente" onClick={() => setMonth(addMonths(month, 1))} className="rounded p-1 text-ink-2 hover:bg-surface-2">
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-ink-3" aria-hidden>
        {WEEKDAYS_ES.map((d, i) => (
          <span key={i} className="py-1">
            {d}
          </span>
        ))}
      </div>

      <div role="grid" className="flex flex-col gap-1.5">
        {monthGrid(month).map((week, wi) => (
          <div key={wi} role="row" className="grid grid-cols-7 justify-items-center">
            {week.map((day, di) => {
              if (!day) return <span key={di} aria-hidden className="size-8" />;
              const selected = value ? isSameDay(day, value) : false;
              const disabled = isDisabled(day);
              const isToday = today ? isSameDay(day, today) : false;
              return (
                <button
                  key={di}
                  type="button"
                  role="gridcell"
                  aria-selected={selected}
                  aria-disabled={disabled}
                  disabled={disabled}
                  onClick={() => onChange(day)}
                  className={cn(
                    "size-8 rounded-full text-[12.5px] transition-[background-color,color,transform] duration-200 hover:scale-105 active:scale-95",
                    selected ? "bg-ink font-semibold text-ink-inverse" : "hover:bg-surface-2",
                    disabled && "text-ink-3 hover:bg-transparent",
                    !selected && !disabled && isToday && "font-semibold underline underline-offset-4",
                  )}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {note ? <p className="text-xs text-ink-2">{note}</p> : null}
    </div>
  );
}
