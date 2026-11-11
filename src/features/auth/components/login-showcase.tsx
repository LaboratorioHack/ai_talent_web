"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";

/**
 * Panel derecho del login (oscuro, como en el diseño): una mesa de revisión en
 * bucle. Entra una hoja de vida, se marcan sus evidencias con el requisito que
 * prueban, recibe su sello y sale hacia el ranking de la derecha, que se arma
 * ordenado por puntaje. Luego entra la siguiente.
 */
type Line = { text: string; req?: string; ok?: boolean };
type Resume = { name: string; headline: string; lines: Line[]; verdict: "Cumple" | "Parcial" | "No cumple"; score: number };

const RESUMES: Resume[] = [
  {
    name: "Julián Ríos Cárdenas",
    headline: "SRE en banca",
    lines: [
      { text: "Operé clústeres de Kubernetes con 99,9 % de disponibilidad.", req: "Kubernetes", ok: true },
      { text: "Pipelines en Azure DevOps para 25 servicios.", req: "Azure", ok: true },
      { text: "Terraform para redes y bases de datos.", req: "IaC", ok: true },
      { text: "Inglés B2, reuniones diarias con EE. UU.", req: "Inglés", ok: true },
    ],
    verdict: "Cumple",
    score: 88,
  },
  {
    name: "Mariana López Gil",
    headline: "Ingeniera DevOps",
    lines: [
      { text: "Despliegues en AWS con CodePipeline.", req: "Azure (AWS 80 %)", ok: true },
      { text: "Contenedores con Docker Compose, sin orquestador.", req: "Kubernetes", ok: false },
      { text: "Infraestructura con CloudFormation.", req: "IaC", ok: true },
      { text: "Inglés avanzado (C1).", req: "Inglés", ok: true },
    ],
    verdict: "Parcial",
    score: 74,
  },
  {
    name: "Daniela Osorio Mejía",
    headline: "Ingeniera de plataforma cloud",
    lines: [
      { text: "Migré 40 microservicios a AKS con Azure DevOps.", req: "Azure", ok: true },
      { text: "Operé clústeres AKS y GKE en producción.", req: "Kubernetes", ok: true },
      { text: "Terraform y Bicep en 3 ambientes.", req: "IaC", ok: true },
      { text: "Inglés C1 (IELTS 7.5).", req: "Inglés", ok: true },
    ],
    verdict: "Cumple",
    score: 92,
  },
];

/* Línea de tiempo de cada hoja, en ms desde que entra. */
const T = { lines: [800, 1300, 1800, 2300], stamp: 3000, exit: 4400, next: 5200 };
const HOLD = 2600;

export function LoginShowcase() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState(0); // 0 entra, 1-4 líneas, 5 sello, 6 sale
  const [ranked, setRanked] = useState<Resume[]>([]);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sin animación: estado final directo
      setPhase(5);
      setRanked([...RESUMES].sort((a, b) => b.score - a.score));
      return;
    }
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    setPhase(0);
    T.lines.forEach((ms, i) => at(ms, () => setPhase(i + 1)));
    at(T.stamp, () => setPhase(5));
    at(T.exit, () => {
      setPhase(6);
      setRanked((r) => [...r, RESUMES[idx]].sort((a, b) => b.score - a.score));
    });
    at(T.next + (idx === RESUMES.length - 1 ? HOLD : 0), () => {
      if (idx === RESUMES.length - 1) {
        setRanked([]);
        setRound((n) => n + 1);
        setIdx(0);
      } else setIdx(idx + 1);
    });
    return () => timers.forEach(clearTimeout);
  }, [idx, round]);

  const cv = RESUMES[idx];
  const tone = cv.verdict === "Cumple" ? "success" : cv.verdict === "Parcial" ? "warning" : "danger";

  return (
    <aside className="dark-scope relative hidden flex-1 flex-col justify-center overflow-hidden bg-bg px-14 lg:flex">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(237,242,238,0.05)_1px,transparent_1.5px)] bg-[length:28px_28px]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -bottom-48 size-[640px] rounded-full bg-[radial-gradient(closest-side,rgba(242,169,59,0.12),transparent)]" />

      <div className="relative flex flex-col gap-10">
        <div className="flex max-w-[560px] flex-col gap-3">
          <h2 className="font-head text-[32px] leading-[1.1] font-semibold tracking-[-0.02em]">Lee cada hoja de vida como lo haría tu mejor reclutador.</h2>
          <p className="text-[15px] text-ink-2">Marca la evidencia de cada requisito, explica el puntaje y ordena el ranking por ti.</p>
        </div>

        <div className="flex items-start gap-8">
          {/* Mesa: la hoja actual, con el montón detrás */}
          <div className="relative h-[400px] w-[400px] shrink-0">
            <div aria-hidden className="paper absolute inset-x-4 top-4 bottom-0 -rotate-3 rounded-[2px] opacity-50 brightness-75" />
            <div aria-hidden className="paper absolute inset-x-2 top-2 bottom-1 rotate-2 rounded-[2px] opacity-70 brightness-[0.85]" />

            <article
              key={`${round}-${idx}`}
              className={cn(
                "paper cv absolute inset-0 rounded-[2px] px-8 pt-8 shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_40px_70px_-30px_rgba(0,0,0,0.9)]",
                phase === 6 ? "animate-[sheet-out_800ms_var(--ease-in-out-soft)_forwards]" : "animate-[sheet-in_700ms_var(--ease-out-soft)_both]",
              )}
            >
              <p className="text-center text-[19px] font-bold tracking-wide">{cv.name}</p>
              <p className="mt-0.5 text-center text-[13px] text-ink-2 italic">{cv.headline}</p>
              <p className="cv-heading mt-5">Experiencia</p>
              <ul className="mt-3 flex flex-col gap-3">
                {cv.lines.map((line, i) => {
                  const on = phase > i;
                  return (
                    <li key={i} className="flex flex-col gap-1">
                      <span className="text-[13px] leading-snug text-ink-2">
                        <span className={cn("marker", on && line.ok && "is-on", on && !line.ok && "line-through decoration-danger/70")}>{line.text}</span>
                      </span>
                      <span
                        className={cn(
                          "w-fit rounded-full px-2 py-0.5 font-sans text-[10.5px] font-medium transition-[opacity,translate] duration-500 ease-[var(--ease-out-soft)]",
                          line.ok ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
                          on ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                        )}
                      >
                        {line.ok ? "Prueba" : "No prueba"} {line.req}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {/* Sello */}
              <div
                className={cn(
                  "absolute right-6 bottom-6 flex -rotate-[9deg] flex-col items-center rounded-md border-[2.5px] px-3 py-1.5 font-sans transition-[opacity,scale] duration-300",
                  tone === "success" && "border-success text-success",
                  tone === "warning" && "border-warning text-warning",
                  tone === "danger" && "border-danger text-danger",
                  phase >= 5 ? "scale-100 opacity-100" : "scale-150 opacity-0",
                )}
                style={{ transitionTimingFunction: "cubic-bezier(0.5,0,0.3,1.4)" }}
              >
                <span className="text-[9.5px] font-bold tracking-[0.2em] uppercase">{cv.verdict}</span>
                <span className="text-[26px] leading-none font-bold">{cv.score}</span>
              </div>
            </article>
          </div>

          {/* Ranking que se arma */}
          <div className="flex w-[260px] flex-col overflow-hidden rounded-2xl border border-border bg-surface">
            <div className="border-b border-border px-4 py-3">
              <p className="text-[13px] font-medium">Ranking</p>
              <p className="text-[11.5px] text-ink-3">Ingeniero Cloud Senior</p>
            </div>
            <ul className="flex min-h-[200px] flex-col">
              {ranked.map((r, i) => (
                <li key={r.name} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0 animate-[drop-in_500ms_var(--ease-out-soft)_both]">
                  <span className="w-3 font-head text-[13px] font-semibold text-ink-3">{i + 1}</span>
                  <Avatar name={r.name} size={26} />
                  <span className="min-w-0 flex-1 truncate text-[12.5px]">{r.name}</span>
                  <span className={cn("font-mono text-[12.5px] font-semibold", r.score >= 80 ? "text-success" : "text-warning")}>{r.score}</span>
                </li>
              ))}
              {ranked.length === 0 ? <li className="px-4 py-6 text-center text-[12px] text-ink-3">Esperando la primera revisión</li> : null}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
}
