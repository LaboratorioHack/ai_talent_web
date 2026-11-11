"use client";

import { forwardRef, useLayoutEffect, useRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { Field } from "./field";

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  label: string;
  kind?: string;
  help?: string;
  error?: string;
  /** Alto mínimo en líneas; crece solo con el contenido hasta maxRows. */
  minRows?: number;
  maxRows?: number;
  containerClassName?: string;
}

/** Texto largo (descripción del cargo, motivos). Crece con el contenido; misma caja que los demás campos. */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextArea(
  { label, kind, help, error, minRows = 3, maxRows = 12, containerClassName, className, value, required, ...rest },
  forwarded,
) {
  const inner = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return;
    const line = parseFloat(getComputedStyle(el).lineHeight) || 21;
    el.style.height = "auto";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, line * minRows + 22), line * maxRows + 22)}px`;
  }, [value, minRows, maxRows]);

  return (
    <Field label={label} kind={kind} help={help} error={error} required={required} className={containerClassName}>
      {({ id, describedBy }) => (
        <textarea
          ref={(el) => {
            inner.current = el;
            if (typeof forwarded === "function") forwarded(el);
            else if (forwarded) forwarded.current = el;
          }}
          id={id}
          value={value}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(
            "field-box w-full resize-none px-3.5 py-2.5 text-[14px] leading-[1.5] text-ink outline-none placeholder:text-ink-3",
            error && "is-invalid",
            className,
          )}
          {...rest}
        />
      )}
    </Field>
  );
});
