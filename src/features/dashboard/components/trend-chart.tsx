"use client";

import { useId, useMemo, useRef, useState } from "react";
import type { DailyPoint } from "../api/dashboard";

const W = 720;
const H = 220;
const PAD = { top: 16, right: 12, bottom: 28, left: 36 };

const SERIES = [
  { key: "received", label: "Recibidas", color: "var(--ink)" },
  { key: "evaluated", label: "Evaluadas", color: "var(--blue)" },
] as const;

/** Redondea el máximo del eje a un número limpio (5, 10, 20, 50…). */
function niceMax(n: number) {
  if (n <= 5) return 5;
  const pow = 10 ** Math.floor(Math.log10(n));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * pow >= n) ?? 10;
  return step * pow;
}

/**
 * Hojas de vida por día: dos líneas con leyenda y etiqueta directa en el último
 * punto. Al pasar el ratón, una guía vertical marca el día y el globo dice las
 * dos cifras exactas.
 */
export function TrendChart({ points }: { points: DailyPoint[] }) {
  const gradient = useId();
  const box = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const { max, x, y, paths, ticks } = useMemo(() => {
    const max = niceMax(Math.max(...points.map((p) => p.received), 1));
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
    const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
    const line = (key: "received" | "evaluated") => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[key]).toFixed(1)}`).join(" ");
    const area = `${line("received")} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
    const every = Math.ceil(points.length / 7);
    const ticks = points.map((p, i) => ({ i, label: p.label })).filter(({ i }) => i % every === 0 || i === points.length - 1);
    return { max, x, y, paths: { received: line("received"), evaluated: line("evaluated"), area }, ticks };
  }, [points]);

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  }

  const h = hover !== null ? points[hover] : null;
  const last = points.length - 1;
  const totals = { received: points.reduce((n, p) => n + p.received, 0), evaluated: points.reduce((n, p) => n + p.evaluated, 0) };

  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="flex flex-wrap items-center gap-5 text-[13px] text-ink-2">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-2">
            <span className="h-[3px] w-4 rounded-full" style={{ background: s.color }} />
            {s.label}
            <span className="font-mono text-[12px] text-ink">{totals[s.key].toLocaleString("es-CO")}</span>
          </span>
        ))}
        <span className="ml-auto text-[12px] text-ink-3">Pasa el cursor para ver cada día</span>
      </figcaption>

      <div className="relative">
        <svg
          ref={box}
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full touch-none select-none"
          role="img"
          aria-label={`Hojas de vida por día: ${totals.received} recibidas y ${totals.evaluated} evaluadas`}
          onPointerMove={onMove}
          onPointerLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id={gradient} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.12" />
              <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(max * f)} y2={y(max * f)} stroke="var(--border)" strokeDasharray={f === 0 ? undefined : "2 4"} />
              <text x={PAD.left - 8} y={y(max * f) + 4} textAnchor="end" className="fill-ink-3 font-mono text-[10.5px]">
                {Math.round(max * f)}
              </text>
            </g>
          ))}
          {ticks.map((t) => (
            <text key={t.i} x={x(t.i)} y={H - 8} textAnchor="middle" className="fill-ink-3 text-[10.5px]">
              {t.label}
            </text>
          ))}

          <path key={`a-${points.length}`} d={paths.area} fill={`url(#${gradient})`} className="animate-fade-in" />
          {SERIES.map((s) => (
            <path
              key={`${s.key}-${points.length}`}
              d={paths[s.key]}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1}
              className="[stroke-dasharray:1] [stroke-dashoffset:1] animate-[draw_1200ms_var(--ease-out-soft)_forwards]"
            />
          ))}

          {h !== null && hover !== null ? (
            <g className="pointer-events-none">
              <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} stroke="var(--border-strong)" />
              {SERIES.map((s) => (
                <circle key={s.key} cx={x(hover)} cy={y(h[s.key])} r={5} fill={s.color} stroke="var(--surface)" strokeWidth={2} />
              ))}
            </g>
          ) : (
            SERIES.map((s) => <circle key={s.key} cx={x(last)} cy={y(points[last][s.key])} r={4} fill={s.color} stroke="var(--surface)" strokeWidth={2} className="animate-fade-in" />)
          )}
        </svg>

        {h !== null && hover !== null ? (
          <div
            className="pointer-events-none absolute top-0 z-10 w-max -translate-x-1/2 rounded-lg bg-panel px-3 py-2 text-[12px] text-ink-inverse shadow-[0_12px_30px_-12px_rgba(21,32,27,0.6)] transition-[left] duration-150 ease-out"
            style={{ left: `${(x(hover) / W) * 100}%` }}
          >
            <p className="mb-1 font-semibold">{h.label}</p>
            <p>{h.received} hojas de vida recibidas</p>
            <p className="opacity-75">{h.evaluated} evaluadas por Criba</p>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
