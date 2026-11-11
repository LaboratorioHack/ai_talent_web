"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Atajo que se muestra a la derecha, p. ej. "⌘K". */
  shortcut?: string;
  containerClassName?: string;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { shortcut, containerClassName, className, placeholder = "Buscar candidato, vacante…", ...rest },
  ref,
) {
  return (
    <div
      className={cn(
        "field-box flex h-10 items-center gap-2 px-3 text-[13.5px]",
        containerClassName,
      )}
    >
      <Search aria-hidden className="size-[15px] shrink-0 text-ink-3" />
      <input
        ref={ref}
        type="search"
        placeholder={placeholder}
        aria-label={rest["aria-label"] ?? placeholder}
        className={cn("h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-3", className)}
        {...rest}
      />
      {shortcut ? <kbd className="font-mono text-[11px] text-ink-3">{shortcut}</kbd> : null}
    </div>
  );
});
