"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ¿Ya se pegó el encabezado sticky? Mide el scroll contra la posición de un
 * centinela colocado justo antes del encabezado, descontando la barra fija
 * (--app-header). Tiene histéresis: se encoge pasados 24px y vuelve a su
 * tamaño al regresar al tope, sin parpadeos en el límite ni en páginas cortas.
 */
export function useStuck<T extends HTMLElement = HTMLDivElement>() {
  const sentinel = useRef<T>(null);
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const offset = parseFloat(getComputedStyle(el).getPropertyValue("--app-header")) || 0;
    let raf = 0;
    const check = () => {
      raf = 0;
      const top = el.getBoundingClientRect().top - offset;
      // Si la página es tan corta que encoger el encabezado la dejaría sin scroll,
      // no se encoge: así no entra en bucle al filtrar listas cortas.
      const room = document.documentElement.scrollHeight - window.innerHeight;
      setStuck((was) => (was ? top < -4 : top < -24 && room > 200));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    raf = requestAnimationFrame(check);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return { sentinel, stuck };
}
