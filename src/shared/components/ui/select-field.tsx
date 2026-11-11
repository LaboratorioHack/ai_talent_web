"use client";

import { Field } from "./field";
import { Select, type SelectProps } from "./select";

export type { SelectOption } from "./select";

export interface SelectFieldProps extends Omit<SelectProps, "id" | "invalid" | "aria-describedby"> {
  label: string;
  kind?: string;
  help?: string;
  error?: string;
  required?: boolean;
  containerClassName?: string;
}

/** Selector con etiqueta: no deja escribir, solo elegir de la lista. */
export function SelectField({ label, kind = "Elegir de lista", help, error, required, containerClassName, ...select }: SelectFieldProps) {
  return (
    <Field label={label} kind={kind} help={help} error={error} required={required} className={containerClassName}>
      {({ id, describedBy }) => <Select id={id} aria-describedby={describedBy} invalid={Boolean(error)} {...select} />}
    </Field>
  );
}
