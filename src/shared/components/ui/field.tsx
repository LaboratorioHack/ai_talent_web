import { useId, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

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
  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <label htmlFor={id} className="truncate text-[13px] font-medium text-ink">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </label>
      {children({ id, describedBy: message ? helpId : undefined })}
      {message || kind ? (
        <div className="flex items-baseline justify-between gap-3">
          <p id={helpId} className={cn("min-w-0 text-xs", error ? "text-danger" : "text-ink-3")} role={error ? "alert" : undefined}>
            {message}
          </p>
          {kind ? <span className="shrink-0 font-mono text-[10.5px] text-ink-3">{kind}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Caja base compartida por texto, selector y fecha. */
export const inputBoxClass = "field-box flex h-11 w-full items-center gap-2 px-3.5 text-[14px] text-ink placeholder:text-ink-3 disabled:opacity-45";

export const inputBorderClass = (error?: boolean) => (error ? "is-invalid" : "");
