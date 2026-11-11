"use client";

import { useEffect, useState } from "react";

/**
 * Mantiene montado un elemento mientras corre su animación de salida.
 * Devuelve `mounted` (renderizar o no) y `state` ("open" | "closed") para
 * engancharlo a `data-state` y animar entrada y salida con CSS.
 */
export function usePresence(open: boolean, exitMs = 180) {
  const [mounted, setMounted] = useState(open);

  if (open && !mounted) setMounted(true);

  useEffect(() => {
    if (open || !mounted) return;
    const t = window.setTimeout(() => setMounted(false), exitMs);
    return () => window.clearTimeout(t);
  }, [open, mounted, exitMs]);

  return { mounted: open || mounted, state: open ? ("open" as const) : ("closed" as const) };
}
