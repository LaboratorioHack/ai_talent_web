"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Mail, Plus, Share2, X } from "lucide-react";
import { evaluationErrorMessage } from "@/features/evaluations/api/errors";
import { compareApplications } from "@/features/evaluations/api/evaluations";
import { PageTop } from "@/shared/components/layout";
import { Button, Collapse, CribaAi, CribaCharacter, CribaThinking, EmptyState, Select, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { startCribaWork } from "@/shared/lib/criba-work";
import { pause, revealEach } from "@/shared/lib/reveal";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { inviteToInterview } from "../api/actions";
import type { TradeoffCandidate, TradeoffCell, TradeoffMatrix as Matrix, TradeoffStatus } from "../types/tradeoffs";

const MAX = 3;
const MIN_COMPARE = 2;

const STATUS: Record<TradeoffStatus, { label: string; dot: string; text: string }> = {
  meets: { label: "Cumple", dot: "bg-success", text: "text-success" },
  partial: { label: "Parcial", dot: "bg-amber", text: "text-[color:var(--ai-ink)]" },
  missing: { label: "Falta", dot: "bg-danger", text: "text-danger" },
  unknown: { label: "No consta", dot: "bg-ink-3", text: "text-ink-3" },
};

const TINT = ["bg-blue-soft/60", "bg-success-soft/60", "bg-amber/10", "bg-danger-soft/50"];

/**
 * Matriz de trade-offs: hasta 3 personas de una vacante, requisito por
 * requisito, con lo que gana la empresa y lo que asume con cada una. No puntúa
 * a nadie: ordena la conversación del equipo antes de invitar.
 */
export function TradeoffMatrix({ data }: { data: Matrix }) {
  const router = useRouter();
  const { toast } = useToast();
  const [shown, setShown] = useState(() => data.candidates.slice(0, MAX).map((c) => c.id));
  const [overrides, setOverrides] = useState<Record<string, Pick<TradeoffCandidate, "gains" | "assumes">>>({});
  const [reading, setReading] = useState(data.reading);
  const [comparing, setComparing] = useState(false);
  // Lo que Criba va pensando al comparar: pasos reales y, al final, lo que devolvió.
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);
  const byId = useMemo(() => new Map(data.candidates.map((c) => [c.id, c])), [data.candidates]);
  const cols = shown
    .map((id) => {
      const base = byId.get(id);
      if (!base) return null;
      const patch = overrides[id];
      return patch ? { ...base, ...patch } : base;
    })
    .filter(Boolean) as TradeoffCandidate[];
  const rest = data.candidates.filter((c) => !shown.includes(c.id));
  const closes = data.job.closesAt ? fromISODate(data.job.closesAt) : null;

  const colKey = cols
    .map((c) => c.id)
    .sort()
    .join(",");

  const runCompare = useCallback(
    async (applicationIds: string[]) => {
      const names = applicationIds.map((id) => byId.get(id)?.name.split(" ")[0]).filter(Boolean);
      const think = (line: string) => setThoughts((t) => [...t, line]);
      setComparing(true);
      setThoughts([`Leo las hojas de vida de ${names.join(", ").replace(/, ([^,]*)$/, " y $1")}`]);
      const done = startCribaWork(`Compara ${applicationIds.length} hojas de vida frente al cargo`);
      const steps = [
        window.setTimeout(() => think("Comparo requisito por requisito lo que prueba cada una"), 2200),
        window.setTimeout(() => think("Busco qué ganas y qué cedes con cada persona"), 5200),
      ];
      try {
        const result = await compareApplications(data.job.id, applicationIds);
        steps.forEach(window.clearTimeout);
        const rows = result.candidates.flatMap((ref) => {
          const row = result.comparison.sideBySideMatrix.find((item) => item.candidateId === ref.resumeId);
          return row ? [{ id: ref.applicationId, gains: row.primaryAdvantage, assumes: row.primaryTradeOffOrGap }] : [];
        });
        // Cada columna se actualiza a su turno, mientras Criba cuenta qué encontró.
        await revealEach(
          rows,
          (row) => {
            think(`${byId.get(row.id)?.name.split(" ")[0] ?? "Esta persona"}: ${row.gains}`);
            setOverrides((o) => ({ ...o, [row.id]: { gains: row.gains, assumes: row.assumes } }));
          },
          1500,
        );
        const summary = result.comparison.comparativeSummary || result.comparison.headToHeadTradeOff;
        if (summary) {
          await pause(900);
          setReading(summary);
          think(summary);
        }
      } catch (error) {
        steps.forEach(window.clearTimeout);
        setThoughts([]);
        toast({ tone: "error", title: "No se pudo comparar", description: evaluationErrorMessage(error) });
      } finally {
        done();
        setComparing(false);
      }
    },
    [byId, data.job.id, toast],
  );

  useEffect(() => {
    if (cols.length < MIN_COMPARE || cols.length > MAX) return;
    const applicationIds = colKey ? colKey.split(",") : [];
  // eslint-disable-next-line react-hooks/set-state-in-effect -- compare async al cambiar la selección
    void runCompare(applicationIds);
  }, [colKey, cols.length, runCompare]);
  const grid = { gridTemplateColumns: `260px repeat(${Math.max(cols.length, 1)}, minmax(220px, 1fr))` };
  const invite = Math.min(2, cols.length);

  /** Invita a entrevista con IA a las primeras de la matriz; vence en 3 días y les llega por correo. */
  async function inviteTop() {
    const people = cols.slice(0, invite);
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 3);
    setInviting(true);
    const results = await Promise.allSettled(people.map((c) => inviteToInterview(data.job.id, c.id, deadline, "es")));
    setInviting(false);
    const sent = people.filter((_, i) => results[i].status === "fulfilled");
    if (sent.length) toast({ title: `Invitamos a ${sent.length} ${sent.length === 1 ? "persona" : "personas"}`, description: sent.map((c) => c.name).join(" y ") });
    if (sent.length < people.length) toast({ tone: "error", title: "Algunas invitaciones no salieron", description: "Revisa que esas postulaciones sigan abiertas y evaluadas." });
  }

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
      description={`Compara de ${MIN_COMPARE} a ${MAX} candidatos contra el perfil del cargo: qué gana la empresa y qué asume con cada uno.`}
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
                onChange={(id) => {
                  if (shown.length >= MAX) return;
                  setShown((s) => [...s, id]);
                }}
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
                          <span className="text-[12px] text-ink-3 tabular-nums">
                            {c.score} de 100 · confianza {c.confidence} %
                          </span>
                        </span>
                      </div>
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
                          return <MatrixCell key={c.id} cell={cell} />;
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

            {thoughts.length ? (
              <CribaThinking thoughts={thoughts} working={comparing} title="Criba AI está comparando" className="animate-rise [animation-delay:120ms]" />
            ) : reading ? (
              <p className="flex flex-wrap items-center gap-3 rounded-2xl bg-amber/8 px-4 py-3 text-[13.5px] leading-snug text-ink-2 ring-1 ring-amber/25 animate-rise [animation-delay:120ms]">
                <CribaCharacter mood={comparing ? "thinking" : "idle"} size={24} />
                <CribaAi label={comparing ? "Comparando" : "Lectura"} />
                <span className="min-w-0 flex-1">{comparing ? "Criba AI está comparando las hojas de vida…" : reading}</span>
              </p>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-4 animate-rise [animation-delay:160ms]">
              <p className="text-[13px] text-ink-3">La matriz no puntúa a las personas: muestra qué ganas y qué cedes con cada una.</p>
              <div className="flex flex-wrap gap-2">
                <Button icon={<Mail />} loading={inviting} disabled={!invite} onClick={inviteTop}>
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

/** Una celda: el estado, una frase que se lee de un vistazo y, si hay, la cita textual a un clic. */
function MatrixCell({ cell }: { cell: TradeoffCell }) {
  const [open, setOpen] = useState(false);
  const s = STATUS[cell.status];
  return (
    <div className="flex flex-col gap-1.5 border-l border-border px-4 py-4">
      <span className={cn("flex items-center gap-1.5 text-[12px] font-medium", s.text)}>
        <span aria-hidden className={cn("size-1.5 rounded-full", s.dot)} />
        {s.label}
      </span>
      <span className={cn("text-[13px] leading-snug text-ink-2", !open && "line-clamp-2")}>{cell.text}</span>
      {cell.quote ? (
        <>
          <Collapse open={open}>
            <q className="block border-l-2 border-amber/60 pl-2.5 text-[12.5px] leading-snug text-ink-3 italic [quotes:'“'_'”']">{cell.quote}</q>
          </Collapse>
          <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="self-start text-[12px] font-medium text-ink-3 underline-offset-4 transition-colors hover:text-ink hover:underline">
            {open ? "Ocultar cita" : "Ver cita"}
          </button>
        </>
      ) : null}
    </div>
  );
}
