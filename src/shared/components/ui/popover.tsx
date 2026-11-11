"use client";

import { useCallback, useId, useRef, useState, type ReactNode } from "react";
import { useDismiss } from "@/shared/hooks/use-dismiss";
import { usePresence } from "@/shared/hooks/use-presence";
import { cn } from "@/shared/lib/cn";

export interface PopoverProps {
  /** Nombre accesible del disparador. */
  label: string;
  /** Contenido del disparador (icono, avatar, texto). */
  trigger: ReactNode;
  triggerClassName?: string;
  align?: "start" | "end";
  width?: number;
  /** Recibe `close` para cerrar desde dentro (p. ej. al elegir una opción). */
  children: (close: () => void) => ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

/**
 * Panel flotante anclado a un botón. Entra y sale con animación, se cierra con
 * clic fuera o Escape y devuelve el foco al disparador.
 */
export function Popover({ label, trigger, triggerClassName, align = "end", width = 320, children, className, onOpenChange }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const buttonId = useId();
  const { mounted, state } = usePresence(open);

  const change = useCallback(
    (next: boolean) => {
      setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const close = useCallback(() => {
    change(false);
    document.getElementById(buttonId)?.focus();
  }, [change, buttonId]);
  useDismiss(root, open, () => change(false));

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        id={buttonId}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => change(!open)}
        className={triggerClassName}
      >
        {trigger}
      </button>
      {mounted ? (
        <div
          id={panelId}
          data-state={state}
          style={{ width }}
          className={cn(
            "absolute top-[calc(100%+10px)] z-50 overflow-hidden rounded-xl border border-border bg-surface shadow-[0_24px_48px_-24px_rgba(21,32,27,0.45)]",
            align === "end" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            "data-[state=open]:animate-[menu-in_240ms_var(--ease-out-soft)_both] data-[state=closed]:animate-[menu-out_160ms_var(--ease-in-out-soft)_both]",
          )}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}
