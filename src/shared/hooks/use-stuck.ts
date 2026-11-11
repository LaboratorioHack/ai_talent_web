"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ¿Ya se pegó el encabezado sticky? Observa un centinela de 1px colocado justo
 * antes del encabezado: cuando sale por arriba, el encabezado está pegado.
 */
export function useStuck<T extends HTMLElement = HTMLDivElement>() {
  const sentinel = useRef<T>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { sentinel, stuck };
}
