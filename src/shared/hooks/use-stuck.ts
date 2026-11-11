"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ¿Ya se pegó el encabezado sticky? Observa un centinela de 1px colocado justo
 * antes del encabezado. Descuenta la barra fija de la página (--app-header),
 * porque el encabezado se pega debajo de ella y no en el borde de la ventana.
 */
export function useStuck<T extends HTMLElement = HTMLDivElement>() {
  const sentinel = useRef<T>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const offset = parseFloat(getComputedStyle(el).getPropertyValue("--app-header")) || 0;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < offset + 1), {
      rootMargin: `-${offset}px 0px 0px 0px`,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { sentinel, stuck };
}
