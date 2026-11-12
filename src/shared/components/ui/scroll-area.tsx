"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface ScrollAreaProps {
  children: ReactNode;
  /** Clases del contenedor (alto o max-height van aquí). */
  className?: string;
  /** Clases del área que se desplaza (padding del contenido). */
  viewportClassName?: string;
  "aria-label"?: string;
}

/**
 * Zona con scroll propio y barra de Criba: fina, aparece al pasar el ratón o
 * al desplazar, se puede arrastrar, y los bordes se difuminan cuando hay más
 * contenido arriba o abajo. El scroll sigue siendo nativo (rueda, teclado,
 * táctil); solo se reemplaza el dibujo de la barra.
 */
export function ScrollArea({ children, className, viewportClassName, ...rest }: ScrollAreaProps) {
  const root = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = root.current;
    const v = viewport.current;
    const t = thumb.current;
    if (!r || !v || !t) return;
    let hide = 0;

    const paint = () => {
      const { scrollTop, scrollHeight, clientHeight } = v;
      const scrollable = scrollHeight > clientHeight + 1;
      r.dataset.scrollable = String(scrollable);
      r.dataset.top = String(scrollTop > 2);
      r.dataset.bottom = String(scrollTop + clientHeight < scrollHeight - 2);
      if (!scrollable) return;
      const track = clientHeight - 8;
      const size = Math.max(28, (clientHeight / scrollHeight) * track);
      const y = (scrollTop / (scrollHeight - clientHeight)) * (track - size);
      t.style.height = `${size}px`;
      t.style.transform = `translateY(${y}px)`;
    };
    const onScroll = () => {
      paint();
      r.dataset.scrolling = "true";
      window.clearTimeout(hide);
      hide = window.setTimeout(() => (r.dataset.scrolling = "false"), 900);
    };

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      const startY = e.clientY;
      const startTop = v.scrollTop;
      const ratio = (v.scrollHeight - v.clientHeight) / (v.clientHeight - 8 - t.offsetHeight);
      r.dataset.dragging = "true";
      const move = (ev: PointerEvent) => {
        v.scrollTop = startTop + (ev.clientY - startY) * ratio;
      };
      const up = () => {
        r.dataset.dragging = "false";
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
    };

    const ro = new ResizeObserver(paint);
    ro.observe(v);
    if (v.firstElementChild) ro.observe(v.firstElementChild);
    v.addEventListener("scroll", onScroll, { passive: true });
    t.addEventListener("pointerdown", onDown);
    paint();
    return () => {
      ro.disconnect();
      v.removeEventListener("scroll", onScroll);
      t.removeEventListener("pointerdown", onDown);
      window.clearTimeout(hide);
    };
  }, []);

  return (
    <div
      ref={root}
      className={cn(
        "group/scroll relative flex min-h-0 flex-col",
        "[--fade:28px] data-[top=true]:[--fade-top:var(--fade)] data-[bottom=true]:[--fade-bottom:var(--fade)]",
        className,
      )}
    >
      <div
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label={rest["aria-label"]}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "[mask-image:linear-gradient(to_bottom,transparent,black_var(--fade-top,0px),black_calc(100%-var(--fade-bottom,0px)),transparent)]",
          viewportClassName,
        )}
      >
        <div>{children}</div>
      </div>
      <div aria-hidden className="pointer-events-none absolute top-1 right-1 bottom-1 w-2 opacity-0 transition-opacity duration-300 group-hover/scroll:opacity-100 group-data-[scrolling=true]/scroll:opacity-100 group-data-[dragging=true]/scroll:opacity-100 group-data-[scrollable=false]/scroll:hidden">
        <div ref={thumb} className="pointer-events-auto absolute right-0 w-1.5 cursor-grab rounded-full bg-ink/20 transition-[background-color,width] duration-200 hover:w-2 hover:bg-ink/40 active:cursor-grabbing group-data-[dragging=true]/scroll:w-2 group-data-[dragging=true]/scroll:bg-ink/45" />
      </div>
    </div>
  );
}
