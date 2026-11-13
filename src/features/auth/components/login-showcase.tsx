"use client";

import { useEffect, useState } from "react";
import { FileSearch, ListChecks, MessagesSquare } from "lucide-react";
import { LogoMark } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

/**
 * Panel derecho del login (oscuro, como en el diseño). Al centro, la criba;
 * alrededor, las hojas de vida tal como llegan: PDF, Word, escaneos y las que
 * sube el propio candidato al postularse. En cada turno una se enciende, viaja
 * por la línea hasta la criba y abajo aparece el resultado. Debajo, qué ganas al entrar.
 */
const STEP_MS = 3400;
const SIZE = 420;
const C = SIZE / 2;
const R = 160;

const SOURCES = [
  { tag: "PDF", name: "Hoja de vida en PDF", angle: -140 },
  { tag: "DOCX", name: "Documento de Word", angle: -40 },
  { tag: "SCAN", name: "Escaneo o foto", angle: 40 },
  { tag: "WEB", name: "Postulación del candidato", angle: 140 },
].map((s) => {
  const a = (s.angle * Math.PI) / 180;
  return { ...s, x: Math.round(Math.cos(a) * R), y: Math.round(Math.sin(a) * R) };
});

/** Lo que sale de la criba para cada formato: sin nombres, como lo ve la IA. */
const RESULTS = [
  { name: "Hoja de vida anonimizada", verdict: "Cumple", detail: "Todos los obligatorios, con su cita", score: 88, tone: "success" },
  { name: "Hoja de vida anonimizada", verdict: "Parcial", detail: "Falta un obligatorio", score: 74, tone: "warning" },
  { name: "Escaneo leído con OCR", verdict: "No cumple", detail: "Faltan tres obligatorios", score: 41, tone: "danger" },
  { name: "Postulación por el enlace", verdict: "Cumple", detail: "Todos los obligatorios, con su cita", score: 92, tone: "success" },
] as const;

const HIGHLIGHTS = [
  { icon: FileSearch, title: "Lee cualquier formato", detail: "PDF, Word, fotos o escaneos, con la estructura que sea." },
  { icon: ListChecks, title: "Puntaje con pruebas", detail: "Cada punto trae la línea del CV que lo respalda." },
  { icon: MessagesSquare, title: "Entrevista con IA", detail: "Preguntas a la medida y contraste con lo que dice el CV." },
];


export function LoginShowcase() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setStep((s) => s + 1), STEP_MS);
    return () => window.clearInterval(t);
  }, []);

  const i = step % SOURCES.length;
  const source = SOURCES[i];
  const result = RESULTS[i];

  return (
    <aside className="dark-scope relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-bg px-12 py-10 lg:flex">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(237,242,238,0.05)_1px,transparent_1.5px)] bg-[length:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div aria-hidden className="pointer-events-none absolute top-[38%] left-1/2 size-[560px] -translate-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.13),transparent)]" />

      {/* En pantallas bajas el contenido se reduce para que el panel nunca haga scroll. */}
      <div className="relative flex flex-col items-center [@media(max-height:900px)]:[zoom:0.88] short:[zoom:0.76] shorter:[zoom:0.66]">
        {/* Escena */}
        <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} aria-hidden>
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="absolute inset-0">
            {SOURCES.map((s, k) => (
              <line
                key={s.tag}
                x1={C + s.x}
                y1={C + s.y}
                x2={C}
                y2={C}
                stroke={k === i ? "rgba(242,169,59,0.7)" : "rgba(237,242,238,0.14)"}
                strokeWidth={k === i ? 1.5 : 1}
                strokeDasharray="3 6"
                className="flow-line transition-[stroke] duration-500"
              />
            ))}
          </svg>

          {/* Fuentes */}
          {SOURCES.map((s, k) => (
            <div
              key={s.tag}
              className="absolute flex flex-col items-center gap-2"
              style={{ left: C + s.x, top: C + s.y, transform: "translate(-50%, -50%)" }}
            >
              <span
                className={cn(
                  "flex size-14 items-center justify-center rounded-2xl bg-surface-2 p-2.5 ring-1 ring-border transition-[box-shadow,transform,translate,scale,rotate] duration-500 ease-[var(--ease-spring)] animate-[float_6s_ease-in-out_infinite]",
                  k === i ? "scale-110 shadow-[0_0_0_4px_rgba(242,169,59,0.45),0_18px_40px_-14px_rgba(0,0,0,0.9)]" : "shadow-[0_14px_30px_-14px_rgba(0,0,0,0.9)]",
                )}
                style={{ animationDelay: `${k * -1.4}s` }}
              >
                <span className="flex h-full w-[30px] flex-col justify-end rounded-[3px] border border-[#1a211d]/15 bg-[#f5f1e8] pb-1">
                  <span className="text-center font-mono text-[8.5px] font-semibold tracking-wide text-[#1a211d]/70">{s.tag}</span>
                </span>
              </span>
              <span className={cn("text-[11.5px] transition-colors duration-500", k === i ? "text-ink" : "text-ink-3")}>{s.name}</span>
            </div>
          ))}

          {/* Hoja que viaja de la fuente a la criba */}
          <span
            key={`paper-${step}`}
            className="travel absolute h-10 w-8 rounded-[3px] bg-[#f5f1e8] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.8)]"
            style={{ left: C - 16, top: C - 20, ["--fx" as string]: `${source.x * 0.78}px`, ["--fy" as string]: `${source.y * 0.78}px` }}
          >
            <span className="absolute inset-x-1.5 top-2 h-[3px] rounded-full bg-[#1a211d]/55" />
            <span className="absolute inset-x-1.5 top-[15px] h-[2px] rounded-full bg-[#1a211d]/25" />
            <span className="absolute top-[21px] right-3 left-1.5 h-[2px] rounded-full bg-[#1a211d]/25" />
            <span className="absolute top-[27px] right-2 left-1.5 h-[2px] rounded-full bg-[#1a211d]/25" />
          </span>

          {/* La marca recibe la hoja y la "lee": su línea resaltada vuelve a pasarse en cada turno. */}
        <div className="absolute flex size-[104px] items-center justify-center rounded-[28px] bg-surface-2 shadow-[0_0_0_10px_rgba(242,169,59,0.07),0_30px_60px_-20px_rgba(0,0,0,0.8)] ring-1 ring-border" style={{ left: C - 52, top: C - 52 }}>
          <span key={step} aria-hidden className="absolute inset-0 rounded-[28px] ring-2 ring-amber/60 animate-[mark-pulse_1400ms_var(--ease-out-soft)_1000ms_both]" />
          <LogoMark size={56} inverse />
        </div>
        </div>

        {/* Resultado de la hoja actual */}
        <div className="relative mt-2 h-[58px] w-[360px]" aria-live="polite">
          <div
            key={`res-${step}`}
            className="absolute inset-0 flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 animate-[result-in_3400ms_var(--ease-out-soft)_both]"
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13.5px] font-medium">{result.name}</span>
              <span className="truncate text-[12px] text-ink-3">{result.detail}</span>
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11.5px] font-medium",
                result.tone === "success" && "bg-success-soft text-success",
                result.tone === "warning" && "bg-warning-soft text-warning",
                result.tone === "danger" && "bg-danger-soft text-danger",
              )}
            >
              {result.verdict}
            </span>
            <span
              className={cn(
                "w-8 text-right font-mono text-[15px] font-semibold",
                result.tone === "success" && "text-success",
                result.tone === "warning" && "text-warning",
                result.tone === "danger" && "text-danger",
              )}
            >
              {result.score}
            </span>
          </div>
        </div>

        {/* Qué ganas al entrar */}
        <div className="relative mt-12 flex w-full max-w-[640px] flex-col items-center gap-8 text-center">
          <h2 className="font-head text-[30px] leading-[1.15] font-semibold tracking-[-0.02em] text-balance animate-rise">Todas tus hojas de vida, revisadas con el mismo criterio.</h2>
          <ul className="grid w-full grid-cols-3 gap-6 text-left">
            {HIGHLIGHTS.map((h, k) => (
              <li key={h.title} className="flex flex-col gap-2.5 animate-rise" style={{ animationDelay: `${150 + k * 120}ms` }}>
                <span className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-amber ring-1 ring-border">
                  <h.icon aria-hidden className="size-4" />
                </span>
                <span className="text-[13.5px] font-medium">{h.title}</span>
                <span className="text-[12.5px] leading-snug text-ink-2">{h.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
