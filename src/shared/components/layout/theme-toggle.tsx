"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { THEME_KEY } from "@/shared/lib/theme";

const listeners = new Set<() => void>();

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

function apply(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // Sin almacenamiento (modo privado): el tema dura hasta recargar.
  }
  listeners.forEach((fn) => fn());
}

/**
 * Cambia el tema revelándolo en un círculo que crece desde (x, y). Usa View
 * Transitions (lo pinta la GPU, sin animar cada elemento); si el navegador no
 * lo tiene o se pidió menos movimiento, cambia sin animación.
 */
function setDark(dark: boolean, x: number, y: number) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduced) {
    apply(dark);
    return;
  }
  const transition = document.startViewTransition(() => apply(dark));
  transition.ready.then(() => {
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

/**
 * Interruptor de tema: una píldora con sol y luna; la perilla se desliza al
 * modo elegido y el tema nuevo se revela en círculo desde el botón.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Modo oscuro"
      title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setDark(!dark, r.left + r.width / 2, r.top + r.height / 2);
      }}
      className={cn("relative flex h-9 w-[68px] shrink-0 items-center rounded-full bg-surface-2 p-1 ring-1 ring-border transition-[box-shadow] duration-300 hover:ring-border-strong", className)}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-1 left-1 size-7 rounded-full bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.12),0_4px_10px_-4px_rgba(0,0,0,0.35)] ring-1 ring-border transition-transform duration-500 ease-[var(--ease-spring)]",
          dark && "translate-x-8",
        )}
      />
      <span className="relative z-10 grid w-full grid-cols-2" aria-hidden>
        <Sun className={cn("mx-auto size-4 transition-[color,transform] duration-500", dark ? "rotate-90 text-ink-3" : "rotate-0 text-amber")} />
        <Moon className={cn("mx-auto size-[15px] transition-[color,transform] duration-500", dark ? "rotate-0 text-ink" : "-rotate-45 text-ink-3")} />
      </span>
    </button>
  );
}
