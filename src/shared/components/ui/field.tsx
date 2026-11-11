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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
          {required ? <span className="text-danger"> *</span> : null}
        </label>
        {kind ? <span className="text-[11px] text-ink-3">{kind}</span> : null}
      </div>
      {children({ id, describedBy: message ? helpId : undefined })}
      {message ? (
        <p id={helpId} className={cn("text-xs", error ? "text-danger" : "text-ink-2")} role={error ? "alert" : undefined}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

/** Caja base compartida por texto, selector y fecha. */
export const inputBoxClass =
  "flex h-10 w-full items-center gap-2 rounded-md border bg-surface px-3 text-[13.5px] text-ink transition-colors " +
  "placeholder:text-ink-3 focus-within:border-ink disabled:opacity-45 aria-invalid:border-danger";

export const inputBorderClass = (error?: boolean) => (error ? "border-danger" : "border-border");
