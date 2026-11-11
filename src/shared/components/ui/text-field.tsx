"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Field, inputBorderClass, inputBoxClass } from "./field";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  kind?: string;
  help?: string;
  error?: string;
  /** Muestra una marca verde cuando el valor fue validado. */
  validated?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  containerClassName?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, kind = "Texto libre", help, error, validated, leading, trailing, containerClassName, className, required, ...rest },
  ref,
) {
  return (
    <Field label={label} kind={kind} help={help} error={error} required={required} className={containerClassName}>
      {({ id, describedBy }) => (
        <div className={cn(inputBoxClass, inputBorderClass(Boolean(error)), validated && "border-success")}>
          {leading}
          <input
            ref={ref}
            id={id}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            required={required}
            className={cn("h-full min-w-0 flex-1 bg-transparent outline-none", className)}
            {...rest}
          />
          {validated ? <Check aria-hidden className="size-4 text-success" /> : trailing}
        </div>
      )}
    </Field>
  );
});
