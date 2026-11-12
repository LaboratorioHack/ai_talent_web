"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Mail, Plus, Share2, X } from "lucide-react";
import { PageTop } from "@/shared/components/layout";
import { Button, CribaAi, EmptyState, Select, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { TradeoffCandidate, TradeoffMatrix as Matrix, TradeoffStatus } from "../types/tradeoffs";

const MAX = 4;

const STATUS: Record<TradeoffStatus, { label: string; dot: string; text: string }> = {
  meets: { label: "Cumple", dot: "bg-success", text: "text-success" },
  partial: { label: "Parcial", dot: "bg-amber", text: "text-[color:var(--ai-ink)]" },
  missing: { label: "Falta", dot: "bg-danger", text: "text-danger" },
  unknown: { label: "No consta", dot: "bg-ink-3", text: "text-ink-3" },
};

const PILL = { blue: "bg-blue-soft text-blue", green: "bg-success-soft text-success", neutral: "bg-surface-2 text-ink-2" } as const;
const TINT = ["bg-blue-soft/60", "bg-success-soft/60", "bg-amber/10", "bg-danger-soft/50"];

/**
 * Matriz de trade-offs: hasta 4 personas de una vacante, requisito por
 * requisito, con lo que gana la empresa y lo que asume con cada una. No puntúa
 * a nadie: ordena la conversación del equipo antes de invitar.
 */
export function TradeoffMatrix({ data }: { data: Matrix }) {
  const router = useRouter();
  const { toast } = useToast();
  const [shown, setShown] = useState(() => data.candidates.slice(0, MAX).map((c) => c.id));
  const byId = useMemo(() => new Map(data.candidates.map((c) => [c.id, c])), [data.candidates]);
  const cols = shown.map((id) => byId.get(id)!).filter(Boolean) as TradeoffCandidate[];
  const rest = data.candidates.filter((c) => !shown.includes(c.id));
  const closes = fromISODate(data.job.closesAt);
  const grid = { gridTemplateColumns: `260px repeat(${Math.max(cols.length, 1)}, minmax(220px, 1fr))` };
  const invite = Math.min(2, cols.length);

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Enlace copiado", description: "Tu equipo ve la misma matriz con estas personas." });
    } catch {
      toast({ tone: "error", title: "No se pudo copiar el enlace" });
    }
  }

  const top = (
    <PageTop
      title="Matriz de trade-offs"
      description={`Compara hasta ${MAX} candidatos contra el perfil del cargo: qué gana la empresa y qué asume con cada uno.`}
      actions={
        <Button icon={<Share2 />} onClick={share} disabled={!cols.length}>
          Compartir con el equipo
        </Button>
      }
    />
  );

  return (
    <div className="flex flex-1 flex-col">
      {top}
      <div className="flex flex-col gap-6 px-4 pt-7 pb-10 sm:px-6 lg:px-12">
        <section className="card flex flex-wrap items-center justify-between gap-4 px-5 py-4 animate-rise">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-soft text-blue">
              <Briefcase aria-hidden className="size-5" />
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex items-center gap-2">
                <span className="truncate text-[16px] font-semibold">{data.job.title}</span>
                <span className="rounded-full bg-success-soft px-2 py-0.5 text-[11.5px] font-medium text-success">{data.job.status === "OPEN" ? "Abierta" : "Cerrada"}</span>
              </span>
              <span className="truncate text-[13px] text-ink-3">
                {data.job.openings} {data.job.openings === 1 ? "plaza" : "plazas"}
                {closes ? ` · cierra el ${formatLongDate(closes)}` : ""} · {data.job.received} hojas de vida · {data.job.meets} cumplen el perfil de cargo
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select aria-label="Cambiar vacante" options={data.jobs} value={data.job.id} onChange={(id) => router.push(routes.tradeoffs(id))} className="w-[220px]" triggerClassName="field-box h-10 w-full px-3.5 text-[13.5px] text-ink" />
            {rest.length && cols.length < MAX ? (
              <Select
                aria-label="Agregar candidato"
                placeholder="Agregar candidato"
                options={rest.map((c) => ({ value: c.id, label: c.name, hint: `${c.score} de 100` }))}
                value=""
                onChange={(id) => setShown((s) => [...s, id])}
                className="w-[200px]"
                triggerClassName="flex h-10 w-full items-center justify-between gap-2 rounded-xl bg-ink px-3.5 text-[13.5px] font-medium text-ink-inverse"
              />
            ) : (
              <Button variant="outline" icon={<Plus />} disabled>
                Agregar candidato
              </Button>
            )}
          </div>
        </section>

        {!cols.length ? (
          <EmptyState
            title="Todavía no hay a quién comparar"
            description="Cuando las personas se postulen y Criba AI las evalúe, aquí comparas a las mejores lado a lado."
            className="mx-auto w-[520px] max-w-full bg-surface animate-rise"
          />
        ) : (
          <>
            <div className="card overflow-x-auto p-0 animate-rise [animation-delay:60ms]">
              <div className="min-w-[1000px]">
                <div className="grid border-b border-border" style={grid}>
                  <div className="flex flex-col justify-end gap-0.5 px-5 py-4">
                    <span className="font-mono text-[11px] tracking-[0.08em] text-ink-3 uppercase">Criterio</span>
                    <span className="text-[12.5px] text-ink-3">del perfil de cargo y de la hoja de vida</span>
                  </div>
                  {cols.map((c) => (
                    <div key={c.id} className="relative flex flex-col gap-2 border-l border-border px-4 py-4">
                      <div className="flex items-center gap-3 pr-6">
                        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-[12.5px] font-semibold text-success">
                          {c.initials}
                        </span>
                        <span className="flex min-w-0 flex-col">
                          <span className="truncate text-[14.5px] font-semibold">{c.name}</span>
                          <span className="text-[12px] text-ink-3">{c.score} de 100 · encaje con el cargo</span>
                        </span>
                      </div>
                      <span className={cn("w-fit rounded-md px-2 py-0.5 text-[11.5px] font-medium", PILL[c.pill.tone])}>{c.pill.label}</span>
                      {cols.length > 2 ? (
                        <button
                          type="button"
                          aria-label={`Quitar a ${c.name} de la matriz`}
                          onClick={() => setShown((s) => s.filter((x) => x !== c.id))}
                          className="absolute top-3 right-3 flex size-7 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
                        >
                          <X aria-hidden className="size-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))}
                </div>

                {data.sections.map((sec) => (
                  <div key={sec.title}>
                    <div className="flex items-baseline gap-3 border-b border-border bg-surface-2/60 px-5 py-2.5">
                      <span className="font-mono text-[11px] tracking-[0.1em] text-ink-2 uppercase">{sec.title}</span>
                      <span className="text-[12px] text-ink-3">{sec.hint}</span>
                    </div>
                    {sec.rows.map((r) => (
                      <div key={r.label} className="grid border-b border-border" style={grid}>
                        <div className="flex flex-col items-start gap-1 px-5 py-4">
                          <span className="text-[14px] font-medium">{r.label}</span>
                          {r.hint ? <span className="text-[12.5px] text-ink-3">{r.hint}</span> : null}
                          <span className="rounded-md px-1.5 py-0.5 font-mono text-[10.5px] text-ink-3 ring-1 ring-border">{r.tag}</span>
                        </div>
                        {cols.map((c) => {
                          const cell = r.cells[c.id] ?? { status: "unknown" as const, text: "No aparece en la hoja de vida." };
                          const s = STATUS[cell.status];
                          return (
                            <div key={c.id} className="flex flex-col gap-1 border-l border-border px-4 py-4">
                              <span className={cn("flex items-center gap-1.5 text-[12px] font-medium", s.text)}>
                                <span aria-hidden className={cn("size-1.5 rounded-full", s.dot)} />
                                {s.label}
                              </span>
                              <span className="text-[13px] leading-snug text-ink-2">{cell.text}</span>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}

                <div className="grid" style={grid}>
                  <div className="flex flex-col gap-1 px-5 py-4">
                    <span className="text-[14px] font-semibold">Lectura del trade-off</span>
                    <span className="text-[12.5px] text-ink-3">qué ganas y qué asumes con cada persona</span>
                  </div>
                  {cols.map((c, i) => (
                    <div key={c.id} className={cn("flex flex-col gap-3 border-l border-border px-4 py-4", TINT[i % TINT.length])}>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10.5px] tracking-[0.1em] text-ink-3 uppercase">Ganas</span>
                        <span className="text-[13.5px] leading-snug font-medium">{c.gains}</span>
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="font-mono text-[10.5px] tracking-[0.1em] text-ink-3 uppercase">Asumes</span>
                        <span className="text-[13px] leading-snug text-ink-2">{c.assumes}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3 text-[12px] text-ink-3">
                  <span className="flex flex-wrap gap-4">
                    {(Object.keys(STATUS) as TradeoffStatus[]).map((k) => (
                      <span key={k} className="flex items-center gap-1.5">
                        <span aria-hidden className={cn("size-1.5 rounded-full", STATUS[k].dot)} />
                        {STATUS[k].label}
                      </span>
                    ))}
                  </span>
                  <span>«No consta» no es un no: pide la evidencia en la entrevista.</span>
                </div>
              </div>
            </div>

            {data.reading ? (
              <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber/8 px-4 py-3 text-[13.5px] leading-snug text-ink-2 ring-1 ring-amber/25 animate-rise [animation-delay:120ms]">
                <CribaAi label="Lectura" />
                <span className="min-w-0 flex-1">{data.reading}</span>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4 animate-rise [animation-delay:160ms]">
              <p className="text-[13px] text-ink-3">La matriz no puntúa a las personas: muestra qué ganas y qué cedes con cada una.</p>
              <div className="flex flex-wrap gap-2">
                {data.secondaryAction ? (
                  <Button variant="outline" onClick={() => toast({ title: data.secondaryAction!, description: "Les llega un enlace para presentarla antes de la entrevista." })}>
                    {data.secondaryAction}
                  </Button>
                ) : null}
                <Button
                  icon={<Mail />}
                  onClick={() => toast({ title: `Invitamos a ${invite} ${invite === 1 ? "persona" : "personas"}`, description: cols.slice(0, invite).map((c) => c.name).join(" y ") })}
                >
                  Invitar a {invite} a entrevista
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
