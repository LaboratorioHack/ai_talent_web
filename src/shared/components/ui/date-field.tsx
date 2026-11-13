"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
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

/** Alto aproximado del calendario, para decidir si se abre hacia arriba. */
const CALENDAR_HEIGHT = 340;

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
  const [portal, setPortal] = useState<{ host: HTMLElement; style: CSSProperties; up: boolean } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close, popRef);
  const { mounted, state } = usePresence(open, 160);

  /**
   * El calendario vive en un portal (body, o el <dialog> del modal), como el menú de Select:
   * así ninguna tarjeta con transform o z-index lo tapa. Se abre hacia arriba si no cabe.
   */
  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const host = (trigger.closest("dialog") as HTMLElement | null) ?? document.body;
    const r = trigger.getBoundingClientRect();
    const origin = host === document.body ? { top: 0, left: 0 } : host.getBoundingClientRect();
    const up = r.bottom + CALENDAR_HEIGHT > window.innerHeight && r.top > CALENDAR_HEIGHT;
    const style: CSSProperties = {
      position: "fixed",
      left: r.left - origin.left,
      ...(up ? { bottom: (host === document.body ? window.innerHeight : origin.top + host.offsetHeight) - r.top + 6 } : { top: r.bottom - origin.top + 6 }),
    };
    setPortal({ host, style, up });
  }, []);

  useEffect(() => {
    if (!open) return;
    let raf = 0;
    const onMove = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [open, place]);

  return (
    <Field label={label} kind={kind} help={help} error={error} className={className}>
      {({ id, describedBy }) => (
        <div ref={rootRef} className="relative">
          <button
            ref={triggerRef}
            id={id}
            type="button"
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-describedby={describedBy}
            onClick={() => {
              if (!open) place();
              setOpen((o) => !o);
            }}
            data-open={open} className={cn(inputBoxClass, inputBorderClass(Boolean(error)), "justify-between text-left", disabled && "opacity-45")}
          >
            <span className={cn(!value && "text-ink-3")}>{value ? formatDateDisplay(value) : placeholder}</span>
            <CalendarIcon aria-hidden className={cn("size-[15px] shrink-0 transition-colors duration-300", open ? "text-ink" : "text-ink-3")} />
          </button>
          {mounted && portal ? createPortal(
            <div
              ref={popRef}
              role="dialog"
              aria-label={label}
              data-state={state}
              style={portal.style}
              className={cn(portal.up ? "origin-bottom-left" : "origin-top-left", "z-[60] rounded-lg shadow-[0_18px_40px_-20px_rgba(21,32,27,0.45)] data-[state=closed]:animate-[menu-out_160ms_var(--ease-in-out-soft)_both] data-[state=open]:animate-[menu-in_240ms_var(--ease-out-soft)_both]")}
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
            </div>,
            portal.host,
          ) : null}
        </div>
      )}
    </Field>
  );
}
