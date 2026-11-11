"use client";

import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Field, inputBorderClass, inputBoxClass } from "./field";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  kind?: string;
  help?: string;
  error?: string;
  containerClassName?: string;
}

/** Selector nativo: no deja escribir, solo elegir de la lista. */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, options, placeholder, kind = "Elegir de lista", help, error, containerClassName, className, required, disabled, ...rest },
  ref,
) {
  return (
    <Field label={label} kind={kind} help={help} error={error} required={required} className={containerClassName}>
      {({ id, describedBy }) => (
        <div className={cn(inputBoxClass, inputBorderClass(Boolean(error)), "relative", disabled && "opacity-45")}>
          <select
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            required={required}
            disabled={disabled}
            className={cn("h-full min-w-0 flex-1 appearance-none bg-transparent pr-6 outline-none", className)}
            {...rest}
          >
            {placeholder ? (
              <option value="" disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute right-3 size-[15px] text-ink-3" />
        </div>
      )}
    </Field>
  );
});
