"use client";

import { useMemo, useState, type DragEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, GripVertical } from "lucide-react";
import { Avatar, ScrollArea, SearchField, Segmented, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { ApiError } from "@/shared/lib/api-client";
import { cn } from "@/shared/lib/cn";
import type { PipelineStage } from "@/shared/types/domain";
import { moveApplication } from "../api/mutations";
import type { PipelineCard } from "../api/vacancies";
import { PIPELINE_TO_API } from "@/shared/lib/vacancy-api";

/** La API avanza de a una etapa y retrocede una para deshacer; lo demás responde 409. */
function moveErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) return "Avanza una etapa a la vez: Recibidos, Cumplen, Entrevista IA y Finalistas.";
  if (error instanceof ApiError && error.status === 404) return "Esta postulación ya no existe.";
  return "Revisa tu conexión e inténtalo de nuevo.";
}

const COLUMNS: { stage: PipelineStage; label: string; hint: string; dot: string }[] = [
  { stage: "received", label: "Recibidos", hint: "Aún sin evaluar", dot: "bg-ink-3" },
  { stage: "evaluated", label: "Evaluados", hint: "No cumplen todo lo obligatorio", dot: "bg-blue" },
  { stage: "meets", label: "Cumplen", hint: "Listos para entrevista", dot: "bg-success" },
  { stage: "interview", label: "Entrevista IA", hint: "Invitados o respondiendo", dot: "bg-amber" },
  { stage: "finalist", label: "Finalistas", hint: "Elegidos por tu equipo", dot: "bg-success-deep" },
];

const TONE = { MEETS: "text-success", PARTIAL: "text-warning", DOES_NOT_MEET: "text-danger" } as const;
const BAR = { MEETS: "bg-success", PARTIAL: "bg-amber", DOES_NOT_MEET: "bg-danger" } as const;

type Filter = "all" | "meets" | "partial";

/**
 * Pantalla 05 · Tablero de pipeline. Cada etapa es una columna con su propio
 * scroll; las tarjetas se arrastran y aterrizan con animación, el cambio se
 * guarda en segundo plano y se puede deshacer desde el aviso.
 */
export function PipelineBoard({ jobId, cards }: { jobId: string; cards: PipelineCard[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(cards);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<PipelineStage | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (c) => c.name.toLowerCase().includes(q) && (filter === "all" || (filter === "meets" ? c.fulfillment === "MEETS" : c.fulfillment === "PARTIAL")),
    );
  }, [items, query, filter]);

  function revert(id: string, stage: PipelineStage) {
    setItems((list) => list.map((c) => (c.id === id ? { ...c, stage } : c)));
  }

  function move(id: string, stage: PipelineStage) {
    const card = items.find((c) => c.id === id);
    if (!card || card.stage === stage) return;
    const previous = card.stage;
    revert(id, stage);
    setLanded(id);
    window.setTimeout(() => setLanded(null), 700);
    // «Recibidos» y «Evaluados» son la misma etapa en la API: entre ellas solo cambia la vista.
    if (PIPELINE_TO_API[previous] === PIPELINE_TO_API[stage]) return;
    const column = COLUMNS.find((c) => c.stage === stage)?.label;
    moveApplication(jobId, id, stage).then(
      () =>
        toast({
          title: `${card.name} pasó a ${column}`,
          description: "Queda registrado en la auditoría.",
          action: {
            label: "Deshacer",
            onClick: () => {
              revert(id, previous);
              moveApplication(jobId, id, previous).catch(() => {
                revert(id, stage);
                toast({ tone: "error", title: "No se pudo deshacer", description: "Esa etapa ya no admite volver atrás." });
              });
            },
          },
        }),
      (error: unknown) => {
        revert(id, previous);
        toast({ tone: "error", title: "No se pudo mover", description: moveErrorMessage(error) });
      },
    );
  }

  function drop(stage: PipelineStage, e: DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragging;
    setOver(null);
    setDragging(null);
    if (id) move(id, stage);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 px-3 pt-4 pb-4 sm:px-8 sm:pt-5 sm:pb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Segmented
            aria-label="Mostrar"
            size="sm"
            value={filter}
            onChange={setFilter}
            items={[
              { value: "all", label: "Todos", count: items.length },
              { value: "meets", label: "Cumplen", count: items.filter((c) => c.fulfillment === "MEETS").length },
              { value: "partial", label: "Parciales", count: items.filter((c) => c.fulfillment === "PARTIAL").length },
            ]}
          />
          <span className="hidden text-[13px] text-ink-3 md:inline">Arrastra una tarjeta para cambiarla de etapa.</span>
        </div>
        <SearchField placeholder="Buscar en esta vacante" containerClassName="w-full sm:w-[260px]" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="flex min-h-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto pb-1 lg:grid lg:snap-none lg:grid-cols-5 lg:overflow-visible">
        {COLUMNS.map((col, ci) => {
          const list = visible.filter((c) => c.stage === col.stage).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
          const isOver = over === col.stage;
          return (
            <section
              key={col.stage}
              aria-label={col.label}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (over !== col.stage) setOver(col.stage);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver(null);
              }}
              onDrop={(e) => drop(col.stage, e)}
              className={cn(
                "flex min-h-0 w-[min(80vw,300px)] shrink-0 snap-start flex-col rounded-2xl ring-1 transition-[background-color,box-shadow] duration-300 animate-rise lg:w-auto",
                isOver ? "bg-surface ring-2 ring-ink/70" : "bg-surface-2/60 ring-border",
              )}
              style={{ animationDelay: `${ci * 60}ms` }}
            >
              <header className="flex flex-col gap-0.5 px-4 pt-4 pb-3">
                <span className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", col.dot)} />
                  <h2 className="text-[14px] font-semibold">{col.label}</h2>
                  <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-surface px-1.5 text-[11px] font-medium text-ink-2 tabular-nums ring-1 ring-border">{list.length}</span>
                </span>
                <span className="text-[12px] text-ink-3">{col.hint}</span>
              </header>

              <ScrollArea aria-label={`Tarjetas de ${col.label}`} className="flex-1" viewportClassName="px-2.5 pb-3">
                <div className="flex flex-col gap-2">
                  <div
                    className={cn(
                      "grid transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease-out-soft)]",
                      dragging && isOver ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="mb-0.5 flex h-16 items-center justify-center rounded-xl border-2 border-dashed border-ink/40 text-[12.5px] text-ink-2">Suelta aquí</div>
                    </div>
                  </div>

                  {list.map((c, i) => (
                    <article
                      key={c.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", c.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDragging(c.id);
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setOver(null);
                      }}
                      className={cn(
                        "group relative flex cursor-grab flex-col gap-2.5 rounded-xl bg-surface p-3.5 ring-1 ring-border transition-[opacity,transform,translate,scale,rotate,box-shadow] duration-300 ease-[var(--ease-out-soft)] active:cursor-grabbing animate-[option-in_340ms_var(--ease-out-soft)_both]",
                        "hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-20px_rgba(21,32,27,0.55)]",
                        dragging === c.id && "scale-[0.97] opacity-40",
                        landed === c.id && "animate-[pop-in_420ms_var(--ease-spring)]",
                      )}
                      style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} size={32} />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[14px] font-medium">{c.name}</span>
                          <span className="truncate text-[11.5px] text-ink-3">{c.source}</span>
                        </span>
                        {c.score !== undefined && c.fulfillment ? (
                          <span className={cn("font-head text-[20px] leading-none font-semibold tabular-nums", TONE[c.fulfillment])}>{c.score}</span>
                        ) : (
                          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-ink-3">Sin evaluar</span>
                        )}
                      </div>
                      {c.score !== undefined && c.fulfillment ? (
                        <span className="h-1 overflow-hidden rounded-full bg-surface-2">
                          <span className={cn("block h-full rounded-full", BAR[c.fulfillment])} style={{ width: `${c.score}%` }} />
                        </span>
                      ) : null}
                      {c.note ? <span className={cn("truncate text-[12px]", c.fulfillment === "MEETS" ? "text-ink-2" : "text-ink-3")}>{c.note}</span> : null}
                      <span className="pointer-events-none absolute right-2.5 bottom-2.5 flex gap-1 opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                        {c.score !== undefined ? (
                          <Link href={routes.ranking(jobId, c.id)} draggable={false} aria-label={`Ver a ${c.name} en el ranking`} className="flex size-7 items-center justify-center rounded-full bg-surface text-ink-2 shadow-[0_4px_12px_-6px_rgba(21,32,27,0.4)] ring-1 ring-border hover:text-ink">
                            <ArrowUpRight aria-hidden className="size-3.5" />
                          </Link>
                        ) : null}
                        <span className="flex size-7 items-center justify-center rounded-full bg-surface text-ink-3 ring-1 ring-border">
                          <GripVertical aria-hidden className="size-3.5" />
                        </span>
                      </span>
                    </article>
                  ))}

                  {list.length === 0 && !(dragging && isOver) ? <p className="rounded-xl border border-dashed border-border-strong px-3 py-6 text-center text-[12.5px] text-ink-3">{dragging ? "Arrastra aquí" : "Nadie en esta etapa"}</p> : null}
                </div>
              </ScrollArea>
            </section>
          );
        })}
      </div>
    </div>
  );
}
