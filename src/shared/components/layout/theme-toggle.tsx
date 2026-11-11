"use client";

import { useState, useSyncExternalStore } from "react";
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
      { duration: 650, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
    );
  });
}

/**
 * Interruptor de tema: una píldora con sol y luna; la perilla se desliza al
 * modo elegido y el tema nuevo se revela en círculo desde el botón.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  // La perilla se desliza primero; el tema se revela cuando ya llegó a su sitio.
  const [pending, setPending] = useState<boolean | null>(null);
  const dark = pending ?? theme;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="Modo oscuro"
      title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      onClick={(e) => {
        if (pending !== null) return;
        const r = e.currentTarget.getBoundingClientRect();
        const next = !theme;
        setPending(next);
        window.setTimeout(() => {
          setDark(next, r.left + r.width / 2, r.top + r.height / 2);
          setPending(null);
        }, 380);
      }}
      className={cn(
        "relative flex h-9 w-[68px] shrink-0 items-center rounded-full p-1 ring-1 transition-[background-color,box-shadow] duration-500",
        dark ? "bg-[#1b2433] ring-white/10" : "bg-[#fdf1d8] ring-[#f2a93b]/30",
        className,
      )}
    >
      {/* Estrellas del fondo en modo oscuro */}
      <span aria-hidden className={cn("absolute inset-0 transition-opacity duration-500", dark ? "opacity-100" : "opacity-0")}>
        <span className="absolute top-[9px] left-[14px] size-[2px] rounded-full bg-white/80 animate-breathe" />
        <span className="absolute top-[19px] left-[22px] size-[1.5px] rounded-full bg-white/60 animate-breathe [animation-delay:1s]" />
        <span className="absolute top-[13px] left-[30px] size-[1.5px] rounded-full bg-white/70 animate-breathe [animation-delay:2s]" />
      </span>
      {/* Perilla: sol dibujado que se vuelve luna al deslizarse */}
      <span
        aria-hidden
        className={cn(
          "relative z-10 size-7 rounded-full shadow-[0_2px_6px_-1px_rgba(0,0,0,0.35)] transition-[transform,background-color] duration-500 ease-[var(--ease-spring)]",
          dark ? "translate-x-8 bg-[#2c3b55]" : "translate-x-0 bg-[#fff6e3]",
        )}
      >
        <svg viewBox="0 0 28 28" className="size-full">
          <g className={cn("origin-center transition-[opacity,transform] duration-500 [transform-box:fill-box]", dark ? "scale-50 rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100")}>
            <g className="origin-center animate-[spin_20s_linear_infinite] [transform-box:fill-box]">
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1="14" y1="3.5" x2="14" y2="6" stroke="#e08a12" strokeWidth="1.6" strokeLinecap="round" transform={`rotate(${i * 45} 14 14)`} />
              ))}
            </g>
            <circle cx="14" cy="14" r="4.6" fill="#f2a93b" />
          </g>
          <g className={cn("origin-center transition-[opacity,transform] duration-500 [transform-box:fill-box]", dark ? "scale-100 rotate-0 opacity-100" : "scale-50 -rotate-90 opacity-0")}>
            <path d="M16.5 7.5a6.8 6.8 0 1 0 4 12.3A5.4 5.4 0 0 1 16.5 7.5Z" fill="#f5f1e8" />
          </g>
        </svg>
      </span>
    </button>
  );
}
