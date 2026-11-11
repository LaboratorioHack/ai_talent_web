"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { Collapse } from "./collapse";

/**
 * Envoltorio común de los campos: etiqueta a la izquierda, tipo de entrada a la
 * derecha ("Texto libre", "Elegir de lista"), y ayuda o error debajo.
 */
export interface FieldProps {
  label: string;
  /** Qué tipo de entrada es: "Texto libre", "Elegir de lista", "Elegir fecha", "1 a 50". */
  kind?: string;
  help?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Recibe el id que debe usar el control para enlazar la etiqueta. */
  children: (ids: { id: string; describedBy?: string }) => ReactNode;
}

export function Field({ label, kind, help, error, required, className, children }: FieldProps) {
  const id = useId();
  const helpId = `${id}-help`;
  const message = error ?? help;
  // Se conserva el último texto para que pueda salir con transición.
  const [shown, setShown] = useState({ message, error: Boolean(error) });
  if (message && (message !== shown.message || Boolean(error) !== shown.error)) setShown({ message, error: Boolean(error) });
  const open = Boolean(message || kind);
  return (
    <div className={cn("flex min-w-0 flex-col", className)}>
      <label htmlFor={id} className="mb-2 truncate text-[13px] font-medium text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children({ id, describedBy: message ? helpId : undefined })}
      <Collapse open={open}>
        <div className="flex items-baseline justify-between gap-3 pt-2">
          <p
            key={`${shown.error}-${shown.message}`}
            id={helpId}
            className={cn("min-w-0 text-xs animate-[fade-in_260ms_var(--ease-out-soft)_both]", message ? (error ? "text-danger" : "text-ink-3") : shown.error ? "text-danger" : "text-ink-3")}
            role={error ? "alert" : undefined}
          >
            {message ?? shown.message}
          </p>
          {kind ? <span className="shrink-0 font-mono text-[10.5px] text-ink-3">{kind}</span> : null}
        </div>
      </Collapse>
    </div>
  );
}

/** Caja base compartida por texto, selector y fecha. */
export const inputBoxClass = "field-box flex h-11 w-full items-center gap-2 px-3.5 text-[14px] text-ink placeholder:text-ink-3 disabled:opacity-45";

export const inputBorderClass = (error?: boolean) => (error ? "is-invalid" : "");
