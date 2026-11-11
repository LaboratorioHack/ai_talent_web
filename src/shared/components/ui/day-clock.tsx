"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/shared/lib/cn";

const subscribe = (notify: () => void) => {
  const t = window.setInterval(notify, 10_000);
  return () => window.clearInterval(t);
};
const getSnapshot = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};
const getServerSnapshot = () => -1;

const dateFmt = new Intl.DateTimeFormat("es-CO", { weekday: "long", day: "numeric", month: "short" });

type Moment = "morning" | "afternoon" | "evening" | "night";
const momentOf = (h: number): Moment => (h >= 5 && h < 12 ? "morning" : h >= 12 && h < 17 ? "afternoon" : h >= 17 && h < 19 ? "evening" : "night");

const GREETING: Record<Moment, string> = { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas tardes", night: "Buenas noches" };
const SKY: Record<Moment, string> = {
  morning: "bg-[linear-gradient(160deg,#fff4dc,#ffd98a)]",
  afternoon: "bg-[linear-gradient(160deg,#fff1cf,#f6b24a)]",
  evening: "bg-[linear-gradient(160deg,#ffd2a6,#e5793d)]",
  night: "bg-[linear-gradient(160deg,#2b3a52,#15201b)]",
};

/** Sol con rayos que giran despacio; al atardecer queda a medio ocultar. */
function Sun({ setting }: { setting: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className="size-full">
      <g className="origin-center animate-[spin_28s_linear_infinite]" style={{ transformBox: "fill-box" }}>
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="20" y1="5" x2="20" y2="9" stroke="#e08a12" strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45} 20 20)`} />
        ))}
      </g>
      <circle cx="20" cy="20" r="7" fill="#f2a93b" className="origin-center animate-[breathe_4s_ease-in-out_infinite]" style={{ transformBox: "fill-box" }} />
      {setting ? <rect x="0" y="26" width="40" height="14" fill="#e5793d" opacity="0.9" /> : null}
    </svg>
  );
}

/** Luna creciente con estrellas que titilan. */
function Moon() {
  return (
    <svg viewBox="0 0 40 40" className="size-full">
      <path d="M24 10a10 10 0 1 0 6 17.5A8 8 0 0 1 24 10Z" fill="#f5f1e8" />
      {[
        [10, 12, "0s"],
        [30, 9, "1.2s"],
        [12, 29, "2.1s"],
      ].map(([x, y, d]) => (
        <circle key={`${x}-${y}`} cx={x as number} cy={y as number} r="1.2" fill="#f5f1e8" className="animate-[breathe_3s_ease-in-out_infinite]" style={{ animationDelay: d as string }} />
      ))}
    </svg>
  );
}

/**
 * Reloj amable para la cabecera: el cielo del momento del día (sol que gira,
 * atardecer o luna), un saludo y la hora en digital con los dos puntos
 * latiendo. En el servidor no pinta la hora (Cache Components no permite
 * leerla en el render); en el cliente aparece con un fundido.
 */
export function DayClock({ name, className }: { name?: string; className?: string }) {
  const minutes = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (minutes < 0) return <span className={cn("block h-12 w-[210px]", className)} aria-hidden />;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const moment = momentOf(h);
  const date = dateFmt.format(new Date()).replace(".", "");

  return (
    <div className={cn("flex items-center gap-3 rounded-full bg-surface py-1.5 pr-5 pl-1.5 ring-1 ring-border animate-fade-in", className)}>
      <span className={cn("flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full p-1 ring-1 ring-black/5", SKY[moment])} aria-hidden>
        {moment === "night" ? <Moon /> : <Sun setting={moment === "evening"} />}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-[12px] text-ink-3">
          {GREETING[moment]}
          {name ? `, ${name}` : ""}
        </span>
        <span className="flex items-baseline gap-2">
          <time className="font-head text-[19px] font-semibold tabular-nums" aria-label={`${h}:${String(m).padStart(2, "0")}`}>
            {String(h).padStart(2, "0")}
            <span className="animate-[breathe_2s_ease-in-out_infinite]">:</span>
            {String(m).padStart(2, "0")}
          </time>
          <span className="text-[12px] text-ink-2 first-letter:uppercase">{date}</span>
        </span>
      </span>
    </div>
  );
}
