"use client";

import { useEffect, useRef } from "react";

export interface AnimatedNumberProps {
  value: number;
  /** ms de la transición entre valores. */
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}

const defaultFormat = (n: number) => Math.round(n).toLocaleString("es-CO");

/**
 * Cifra que cuenta hasta su valor al aparecer y al cambiar (p. ej. al filtrar).
 * Escribe en el DOM para no re-renderizar en cada cuadro.
 */
export function AnimatedNumber({ value, duration = 900, format = defaultFormat, className }: AnimatedNumberProps) {
  const el = useRef<HTMLSpanElement>(null);
  const from = useRef(0);

  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const start = from.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      node.textContent = format(value);
      from.current = value;
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 4);
      const current = start + (value - start) * eased;
      node.textContent = format(current);
      from.current = current;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, format]);

  return (
    <span ref={el} className={className} aria-label={format(value)}>
      {format(value)}
    </span>
  );
}
