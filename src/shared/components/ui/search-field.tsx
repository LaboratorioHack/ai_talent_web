"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type InputHTMLAttributes } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Atajo que se muestra a la derecha, p. ej. "Ctrl K". */
  shortcut?: string;
  containerClassName?: string;
  /** Crece al enfocarse y aparta lo que tiene al lado. Activo por defecto. */
  expand?: boolean;
}

/**
 * Buscador. Al enfocarlo se ensancha con un resorte suave y empuja a sus
 * vecinos; al salir (clic fuera, Escape o scroll) vuelve a su tamaño.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { shortcut, containerClassName, className, placeholder = "Buscar candidato, vacante…", expand = true, onFocus, onBlur, onKeyDown, ...rest },
  ref,
) {
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [width, setWidth] = useState<number | null>(null);
  useImperativeHandle(ref, () => input.current as HTMLInputElement);

  // Mientras está ancho, un scroll de la página lo devuelve a su sitio.
  useEffect(() => {
    if (width === null) return;
    const onScroll = () => input.current?.blur();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [width]);

  const hasValue = typeof rest.value === "string" && rest.value.length > 0;

  return (
    <div
      ref={box}
      data-expanded={width !== null}
      style={width !== null ? { width, flexShrink: 0 } : undefined}
      className={cn(
        "field-box flex h-10 items-center gap-2 px-3 text-[13.5px] transition-[width,box-shadow,border-color] duration-500 ease-[var(--ease-spring)]",
        "data-[expanded=true]:shadow-[0_12px_30px_-18px_rgba(21,32,27,0.45)]",
        containerClassName,
      )}
    >
      <Search aria-hidden className="size-[15px] shrink-0 text-ink-3" />
      <input
        ref={input}
        type="search"
        placeholder={placeholder}
        aria-label={rest["aria-label"] ?? placeholder}
        className={cn("h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-ink-3 [&::-webkit-search-cancel-button]:hidden", className)}
        onFocus={(e) => {
          const el = box.current;
          // Solo crece si tiene espacio al lado; a todo lo ancho ya no hace falta.
          if (expand && el && el.offsetWidth < (el.parentElement?.clientWidth ?? 0) - 40) {
            setWidth(Math.max(el.offsetWidth + 160, 380));
          }
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setWidth(null);
          onBlur?.(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") input.current?.blur();
          onKeyDown?.(e);
        }}
        {...rest}
      />
      {hasValue && rest.onChange ? (
        <button
          type="button"
          aria-label="Borrar búsqueda"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const el = input.current;
            if (!el) return;
            const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
            setter?.call(el, "");
            el.dispatchEvent(new Event("input", { bubbles: true }));
          }}
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink animate-[pop-in_240ms_var(--ease-spring)_both]"
        >
          <X aria-hidden className="size-3.5" />
        </button>
      ) : null}
      {shortcut ? <kbd className="font-sans text-[11px] text-ink-3">{shortcut}</kbd> : null}
    </div>
  );
});
