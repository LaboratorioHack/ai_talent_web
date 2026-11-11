"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check, ExternalLink, TriangleAlert } from "lucide-react";
import { Avatar } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

/**
 * Panel derecho del login (oscuro, como en el diseño): un recorrido en bucle por
 * lo que se hace dentro de Criba. Cuatro escenas que se suceden solas; las
 * barras de abajo muestran el avance y permiten saltar. Pasar el ratón pausa.
 */
const SCENE_MS = 4200;

interface Scene {
  title: string;
  body: string;
  render: () => ReactNode;
}

const scenes: Scene[] = [
  { title: "Define la vacante", body: "Obligatorios, deseables y descalificantes, con pesos que suman 100.", render: () => <VacancyScene /> },
  { title: "Recibe hojas de vida de todos lados", body: "Portales, ATS, carpetas y correo, en PDF, Word o foto.", render: () => <InboxScene /> },
  { title: "Lee el ranking con evidencia", body: "Cada punto del puntaje trae la cita del CV que lo prueba.", render: () => <RankingScene /> },
  { title: "Entrevista con IA", body: "Preguntas a la medida y contraste con lo que dice el CV.", render: () => <InterviewScene /> },
];

export function LoginShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % scenes.length);
      setCycle((c) => c + 1);
    }, SCENE_MS);
    return () => window.clearTimeout(t);
  }, [index, paused, cycle]);

  const scene = scenes[index];

  return (
    <aside
      className="dark-scope relative hidden flex-1 flex-col justify-center overflow-hidden bg-bg px-16 lg:flex"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(237,242,238,0.05)_1px,transparent_1.5px)] bg-[length:28px_28px]" />
      <div aria-hidden className="pointer-events-none absolute -top-48 -right-48 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.12),transparent)]" />

      <div className="relative flex w-full max-w-[600px] flex-col gap-8">
        <div key={`t-${index}-${cycle}`} className="flex min-h-[92px] flex-col gap-2 animate-rise">
          <h2 className="font-head text-[32px] leading-[1.1] font-semibold tracking-[-0.02em]">{scene.title}</h2>
          <p className="text-[15px] text-ink-2">{scene.body}</p>
        </div>

        <div className="relative h-[340px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
          <div key={`s-${index}-${cycle}`} className="absolute inset-0 animate-[scene-in_700ms_var(--ease-out-soft)_both]">
            {scene.render()}
          </div>
        </div>

        <div className="flex gap-2" role="tablist" aria-label="Recorrido">
          {scenes.map((s, i) => (
            <button
              key={s.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={s.title}
              onClick={() => {
                setIndex(i);
                setCycle((c) => c + 1);
              }}
              className="group h-6 flex-1"
            >
              <span className="block h-[3px] overflow-hidden rounded-full bg-surface-3 transition-colors group-hover:bg-border-strong">
                <span
                  key={`p-${i}-${index}-${cycle}`}
                  className={cn("block h-full origin-left rounded-full bg-amber", i < index ? "scale-x-100" : "scale-x-0")}
                  style={
                    i === index
                      ? { animation: `scene-progress ${SCENE_MS}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }
                      : undefined
                  }
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ---------- Escenas ---------- */

const step = (i: number, base = 250, gap = 160) => ({ animationDelay: `${base + i * gap}ms` });

function VacancyScene() {
  const reqs = [
    { name: "Azure (AKS, DevOps)", type: "Obligatorio", w: 25, tone: "bg-ink text-ink-inverse" },
    { name: "Kubernetes en producción", type: "Obligatorio", w: 20, tone: "bg-ink text-ink-inverse" },
    { name: "Cert. Azure Architect", type: "Deseable", w: 15, tone: "bg-surface-2 text-ink" },
    { name: "Trabaja hoy en un competidor", type: "Descalificante", w: 0, tone: "bg-danger-soft text-danger" },
  ];
  return (
    <div className="flex h-full flex-col p-6">
      <p className="text-[15px] font-medium">Ingeniero Cloud Senior</p>
      <p className="text-[12px] text-ink-3">Tecnología · cierra el 30 nov · 2 vacantes</p>
      <ul className="mt-5 flex flex-col gap-2.5">
        {reqs.map((r, i) => (
          <li key={r.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 animate-rise" style={step(i)}>
            <span className="min-w-0 flex-1 truncate text-[13px]">{r.name}</span>
            <span className={cn("w-[104px] rounded-md px-2 py-1 text-center text-[11px] font-medium", r.tone)}>{r.type}</span>
            <span className="w-16">
              {r.w ? (
                <span className="block h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <span className="grow-x block h-full rounded-full bg-amber" style={{ width: `${r.w * 4}%`, ...step(i, 600) }} />
                </span>
              ) : (
                <span className="block text-center text-[11px] text-ink-3">sin peso</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-auto flex items-center justify-between text-[12px] text-ink-3 animate-rise" style={step(5)}>
        <span>Suma de pesos</span>
        <span className="font-mono text-success">100 / 100</span>
      </p>
    </div>
  );
}

function InboxScene() {
  const files = [
    { logo: "linkedin", file: "perfil_exportado.pdf", note: "LinkedIn" },
    { logo: "computrabajo", file: "hoja_de_vida_2026.pdf", note: "Computrabajo" },
    { logo: "gmail", file: "escaneo_firmado.pdf", note: "Gmail · escaneo" },
    { logo: "gdrive", file: "IMG_4402.jpg", note: "Google Drive · foto" },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="flex items-center gap-2 text-[13.5px] font-medium">
          <span className="size-2 animate-[breathe_1.6s_ease-in-out_infinite] rounded-full bg-amber" />
          Bandeja de la vacante
        </span>
        <span className="text-[12px] text-ink-3">leyendo</span>
      </div>
      <ul className="flex flex-col">
        {files.map((f, i) => (
          <li key={f.file} className="flex items-center gap-3 border-b border-border px-6 py-3 animate-[drop-in_700ms_var(--ease-out-soft)_both]" style={step(i, 200, 420)}>
            {/* eslint-disable-next-line @next/next/no-img-element -- icono estático pequeño */}
            <img src={`/logos/${f.logo}.png`} alt="" width={24} height={24} className="size-6 rounded-[6px] bg-white p-0.5" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-[13px]">{f.file}</span>
              <span className="text-[11.5px] text-ink-3">{f.note}</span>
            </span>
            <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11px] text-success animate-[pop-in_400ms_var(--ease-spring)_both]" style={step(i, 700, 420)}>
              leída
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RankingScene() {
  const rows = [
    { name: "Daniela Osorio", score: 92 },
    { name: "Julián Ríos", score: 88 },
    { name: "Sebastián Vega", score: 85 },
  ];
  return (
    <div className="flex h-full flex-col">
      <ul className="flex flex-col">
        {rows.map((r, i) => (
          <li key={r.name} className={cn("flex items-center gap-3 border-b border-border px-6 py-3 animate-rise", i === 0 && "bg-surface-2")} style={step(i)}>
            <span className="w-3 font-head text-[14px] font-semibold text-ink-3">{i + 1}</span>
            <Avatar name={r.name} size={30} />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="text-[13px] font-medium">{r.name}</span>
              <span className="h-[3px] overflow-hidden rounded-full bg-surface-3">
                <span className="grow-x block h-full rounded-full bg-success" style={{ width: `${r.score}%`, ...step(i, 500) }} />
              </span>
            </span>
            <span className="font-mono text-[14px] font-semibold text-success">{r.score}</span>
          </li>
        ))}
      </ul>
      <div className="m-5 mt-auto flex items-start gap-3 rounded-xl border border-border bg-bg/60 p-4 animate-rise" style={step(3, 900)}>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
          <Check aria-hidden className="size-3.5" />
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="flex justify-between gap-3 text-[12.5px] font-medium">
            Azure (AKS, DevOps) <span className="font-mono text-success">+25</span>
          </span>
          <span className="text-[13px] text-ink-2">
            <span className="marker is-on [--marker-delay:1300ms]">&ldquo;Migré 40 microservicios a AKS y diseñé los pipelines.&rdquo;</span>
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10.5px] text-blue">
            <ExternalLink aria-hidden className="size-3" />
            CV pág. 1 · 2022–2025
          </span>
        </span>
      </div>
    </div>
  );
}

function InterviewScene() {
  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <p className="text-[12px] text-ink-3 animate-rise" style={step(0, 100)}>
        Pregunta 4 de 9 · Kubernetes
      </p>
      <p className="max-w-[85%] text-[14px] animate-rise" style={step(1, 100)}>
        ¿Qué disponibilidad alcanzaron y cómo la medían?
      </p>
      <div className="flex justify-end">
        <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-surface-2 px-4 py-2.5 text-[13.5px] animate-rise" style={step(2, 500, 300)}>
          99,9 %. Usábamos Prometheus y alertas en Grafana.
        </p>
      </div>
      <div className="mt-auto flex flex-col gap-2 rounded-xl border border-border p-4 animate-rise" style={step(3, 900, 300)}>
        <p className="text-[12px] text-ink-3">Contraste con el CV</p>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="w-28">Disponibilidad</span>
          <span className="flex-1 font-mono text-ink-2">CV: 99,95 %</span>
          <span className="flex-1 font-mono text-warning">Dice: 99,9 %</span>
          <TriangleAlert aria-label="No coincide" className="size-4 text-warning" />
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="w-28">Microservicios</span>
          <span className="flex-1 font-mono text-ink-2">CV: 40</span>
          <span className="flex-1 font-mono text-ink-2">Dice: 40</span>
          <Check aria-label="Coincide" className="size-4 text-success" />
        </div>
      </div>
    </div>
  );
}
