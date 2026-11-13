"use client";

import { useEffect, useState } from "react";

/**
 * Escribe `text` palabra por palabra (para lo que redacta Criba AI). Devuelve
 * lo escrito hasta ahora y si ya terminó. Con «reducir movimiento», todo junto.
 */
export function useTypewriter(text: string, wordMs = 45): { shown: string; done: boolean } {
  const [source, setSource] = useState(text);
  const [count, setCount] = useState(0);
  const words = text.split(/(\s+)/);

  // Texto nuevo: vuelve a empezar (ajuste durante el render, sin efecto).
  if (source !== text) {
    setSource(text);
    setCount(0);
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setCount(Number.MAX_SAFE_INTEGER));
      return () => cancelAnimationFrame(raf);
    }
    const t = window.setInterval(() => setCount((n) => n + 1), wordMs);
    return () => window.clearInterval(t);
  }, [text, wordMs]);

  const done = count >= words.length;
  return { shown: done ? text : words.slice(0, count).join(""), done };
}
