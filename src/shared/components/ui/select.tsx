"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";
import { useDismiss } from "@/shared/hooks/use-dismiss";
import { usePresence } from "@/shared/hooks/use-presence";
import { cn } from "@/shared/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
  /** Texto secundario bajo la etiqueta. */
  hint?: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  /** Para enlazar ayuda/errores del <Field>. */
  "aria-describedby"?: string;
  "aria-label"?: string;
  invalid?: boolean;
  /** Clases del disparador; reemplazan el aspecto de caja por defecto. */
  triggerClassName?: string;
  /** Ancho mínimo de la lista, por si el disparador es estrecho. */
  menuMinWidth?: number;
  /** Contenido a la izquierda del valor (icono, punto de color). */
  leading?: ReactNode;
  className?: string;
}

const defaultTrigger = "field-box h-11 w-full px-3.5 text-[14px] text-ink";

/**
 * Desplegable propio (patrón combobox de solo selección): no deja escribir,
 * se maneja con teclado (flechas, Inicio/Fin, Enter, Escape y búsqueda por
 * letra) y anima la apertura y el cierre.
 */
export function Select({
  options,
  value: controlled,
  defaultValue,
  onChange,
  placeholder = "Elige una opción",
  disabled,
  id,
  invalid,
  triggerClassName,
  menuMinWidth,
  leading,
  className,
  ...aria
}: SelectProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const value = controlled ?? uncontrolled;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef({ text: "", at: 0 });
  const listId = useId();
  const { mounted, state } = usePresence(open, 160);

  const selectedIndex = useMemo(() => options.findIndex((o) => o.value === value), [options, value]);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  const [portal, setPortal] = useState<{ host: HTMLElement; style: CSSProperties; up: boolean } | null>(null);

  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close, listRef);

  /**
   * El menú vive en un portal (body, o el <dialog> si el select está en un
   * modal) para que ningún contenedor con overflow, transform o z-index lo
   * tape. Se posiciona junto al disparador y se abre hacia arriba si no cabe.
   */
  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const host = (trigger.closest("dialog") as HTMLElement | null) ?? document.body;
    const r = trigger.getBoundingClientRect();
    const origin = host === document.body ? { top: 0, left: 0 } : host.getBoundingClientRect();
    const up = r.bottom + 272 > window.innerHeight && r.top > 272;
    const style: CSSProperties = {
      position: "fixed",
      left: r.left - origin.left,
      width: r.width,
      minWidth: menuMinWidth,
      ...(up ? { bottom: (host === document.body ? window.innerHeight : origin.top + host.offsetHeight) - r.top + 6 } : { top: r.bottom - origin.top + 6 }),
    };
    setPortal({ host, style, up });
  }, [menuMinWidth]);

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

  const enabledIndex = (from: number, step: 1 | -1) => {
    for (let i = 1; i <= options.length; i++) {
      const idx = (from + step * i + options.length) % options.length;
      if (!options[idx]?.disabled) return idx;
    }
    return from;
  };

  const scrollIntoView = (idx: number) => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${idx}"]`)?.scrollIntoView({ block: "nearest" });
  };

  function openMenu(at = selectedIndex >= 0 ? selectedIndex : enabledIndex(-1, 1)) {
    if (disabled) return;
    place();
    setActive(at);
    setOpen(true);
    requestAnimationFrame(() => scrollIntoView(at));
  }

  function choose(idx: number) {
    const opt = options[idx];
    if (!opt || opt.disabled) return;
    if (controlled === undefined) setUncontrolled(opt.value);
    onChange?.(opt.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function move(next: number) {
    setActive(next);
    scrollIntoView(next);
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) openMenu();
        else move(enabledIndex(active, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        if (!open) openMenu();
        else move(enabledIndex(active, -1));
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          move(enabledIndex(-1, 1));
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          move(enabledIndex(options.length, -1));
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open && active >= 0) choose(active);
        else openMenu();
        break;
      case "Tab":
        if (open) setOpen(false);
        break;
      default:
        if (e.key.length === 1 && /\S/.test(e.key)) {
          const now = Date.now();
          const t = typeahead.current;
          t.text = now - t.at > 600 ? e.key.toLowerCase() : t.text + e.key.toLowerCase();
          t.at = now;
          const match = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(t.text));
          if (match >= 0) {
            if (open) move(match);
            else if (controlled === undefined || onChange) choose(match);
          }
        }
    }
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={aria["aria-describedby"]}
        aria-label={aria["aria-label"]}
        disabled={disabled}
        data-open={open}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={cn(
          "flex items-center gap-2 text-left transition-[border-color,background-color,color,box-shadow] duration-300 ease-[var(--ease-out-soft)] disabled:cursor-not-allowed disabled:opacity-45",
          triggerClassName ?? defaultTrigger,
          !triggerClassName && invalid && "is-invalid",
        )}
      >
        {leading}
        <span className={cn("min-w-0 flex-1 truncate", !selected && "text-ink-3")}>{selected?.label ?? placeholder}</span>
        <ChevronDown
          aria-hidden
          className={cn("size-[15px] shrink-0 opacity-70 transition-transform duration-300 ease-[var(--ease-out-soft)]", open && "rotate-180")}
        />
      </button>

      {mounted && portal ? createPortal(
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          data-state={state}
          style={portal.style}
          className={cn(
            "z-[60] max-h-64 overflow-auto rounded-xl border border-border bg-surface p-1.5 text-ink",
            portal.up ? "origin-bottom" : "origin-top",
            "shadow-[0_18px_40px_-20px_rgba(21,32,27,0.45)]",
            "data-[state=open]:animate-[menu-in_220ms_var(--ease-out-soft)_both] data-[state=closed]:animate-[menu-out_160ms_var(--ease-in-out-soft)_both]",
          )}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isActive = idx === active;
            return (
              <li
                key={opt.value}
                id={`${listId}-${idx}`}
                data-index={idx}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled || undefined}
                onPointerMove={() => !opt.disabled && active !== idx && setActive(idx)}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(idx)}
                style={{ animationDelay: `${Math.min(idx, 8) * 18}ms` }}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition-colors duration-150",
                  "animate-[option-in_260ms_var(--ease-out-soft)_both]",
                  isActive && !opt.disabled && "bg-surface-2",
                  isSelected && "font-medium",
                  opt.disabled && "cursor-not-allowed text-ink-3",
                )}
              >
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{opt.label}</span>
                  {opt.hint ? <span className="truncate text-xs text-ink-3">{opt.hint}</span> : null}
                </span>
                <Check
                  aria-hidden
                  className={cn(
                    "size-3.5 shrink-0 transition-[opacity,transform] duration-300 ease-[var(--ease-spring)]",
                    isSelected ? "scale-100 opacity-100" : "scale-50 opacity-0",
                  )}
                />
              </li>
            );
          })}
        </ul>,
        portal.host,
      ) : null}
    </div>
  );
}
