"use client";

import { useSyncExternalStore } from "react";

const subscribe = (notify: () => void) => {
  const t = window.setInterval(notify, 15_000);
  return () => window.clearInterval(t);
};
const getSnapshot = () => {
  const d = new Date();
  return `${d.toDateString()} ${d.getHours()}:${d.getMinutes()}`;
};
const getServerSnapshot = () => "";

const dateFmt = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "long" });
const timeFmt = new Intl.DateTimeFormat("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false });

/**
 * Fecha y hora de la persona, discretas: "miércoles, 11 de noviembre 10:42".
 * En el servidor no se pinta nada (Cache Components no permite leer la hora
 * en el render); en el cliente aparece con un fundido y se actualiza sola.
 */
export function LiveClock({ className }: { className?: string }) {
  const key = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (!key) return <span className={className}>&nbsp;</span>;
  const now = new Date();
  const date = dateFmt.format(now);
  return (
    <span className={className}>
      <span className="animate-fade-in">
        {date.charAt(0).toUpperCase() + date.slice(1)}
        <span className="mx-2 inline-block h-3 w-px translate-y-[1px] bg-border-strong" aria-hidden />
        <time className="font-mono tabular-nums">{timeFmt.format(now)}</time>
      </span>
    </span>
  );
}
