"use client";

import { useEffect, type RefObject } from "react";

/** Cierra un popover al hacer clic fuera de `ref` o al pulsar Escape. */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onDismiss();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onDismiss();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [ref, open, onDismiss]);
}
