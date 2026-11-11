"use client";

import { useMemo, useState, type DragEvent } from "react";
import Link from "next/link";
import { GripVertical } from "lucide-react";
import { Avatar, SearchField, StatusChip, useToast, type EvaluationStatus } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import type { Application, PipelineStage } from "@/shared/types/domain";
import { moveApplication } from "../api/mutations";

const COLUMNS: { stage: PipelineStage; label: string; accent: string; hint: string }[] = [
  { stage: "received", label: "Recibidos", accent: "bg-ink-3", hint: "Arrastra aquí para devolver a recibidos" },
  { stage: "evaluated", label: "Evaluados", accent: "bg-blue", hint: "Arrastra aquí para marcar como evaluado" },
  { stage: "meets", label: "Cumplen", accent: "bg-success", hint: "Arrastra aquí si cumple el perfil" },
  { stage: "interview", label: "Entrevista IA", accent: "bg-amber", hint: "Arrastra aquí para invitar a entrevista" },
  { stage: "finalist", label: "Finalistas", accent: "bg-success-deep", hint: "Arrastra aquí para marcar finalista" },
];

const chipFor = (a: Application): EvaluationStatus => {
  const f = a.evaluation?.fulfillment;
  if (!f) return "unevaluated";
  return f === "MEETS" ? "meets" : f === "PARTIAL" ? "partial" : "does_not_meet";
};
const scoreTone = (n: number) => (n >= 80 ? "text-success" : n >= 60 ? "text-warning" : "text-danger");

/**
 * Pantalla 05 · Tablero de pipeline. Se arrastra la tarjeta a otra columna y
 * aterriza con animación; el cambio se envía a la API en segundo plano.
 */
export function PipelineBoard({ jobId, applications }: { jobId: string; applications: Application[] }) {
  const { toast } = useToast();
  const [items, setItems] = useState(applications);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<PipelineStage | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => items.filter((a) => a.candidate.name.toLowerCase().includes(query.trim().toLowerCase())), [items, query]);

  function drop(stage: PipelineStage, e: DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || dragging;
    setOver(null);
    setDragging(null);
    if (!id) return;
    const app = items.find((a) => a.id === id);
    if (!app || app.stage === stage) return;
    const previous = app.stage;
    setItems((list) => list.map((a) => (a.id === id ? { ...a, stage } : a)));
    setLanded(id);
    window.setTimeout(() => setLanded(null), 700);
    const column = COLUMNS.find((c) => c.stage === stage)?.label;
    moveApplication(id, stage).then(
      () =>
        toast({
          title: `${app.candidate.name} pasó a ${column}`,
          action: {
            label: "Deshacer",
            onClick: () => {
              setItems((list) => list.map((a) => (a.id === id ? { ...a, stage: previous } : a)));
              void moveApplication(id, previous);
            },
          },
        }),
      () => {
        setItems((list) => list.map((a) => (a.id === id ? { ...a, stage: previous } : a)));
        toast({ tone: "error", title: "No se pudo mover", description: "Revisa tu conexión e inténtalo de nuevo." });
      },
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[13px] text-ink-2">Arrastra una tarjeta para cambiarla de etapa. Cada cambio queda en la auditoría.</p>
        <SearchField placeholder="Buscar en esta vacante" containerClassName="w-[260px]" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid flex-1 grid-cols-5 gap-4">
        {COLUMNS.map((col, ci) => {
          const cards = visible.filter((a) => a.stage === col.stage).sort((a, b) => (b.evaluation?.totalScore ?? 0) - (a.evaluation?.totalScore ?? 0));
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
                "flex min-h-[420px] flex-col gap-2.5 rounded-2xl p-2 transition-[background-color,box-shadow] duration-300 animate-rise",
                isOver ? "bg-surface-2 shadow-[inset_0_0_0_2px_var(--border-strong)]" : "bg-transparent",
              )}
              style={{ animationDelay: `${ci * 60}ms` }}
            >
              <header className="flex items-center gap-2 px-2 pt-1 pb-1.5">
                <span className={cn("size-2 rounded-full", col.accent)} />
                <h2 className="text-[13.5px] font-semibold">{col.label}</h2>
                <span className="rounded-full bg-surface-2 px-1.5 py-px font-mono text-[11px] text-ink-2">{cards.length}</span>
              </header>

              {cards.map((a) => {
                const score = a.evaluation?.totalScore;
                return (
                  <article
                    key={a.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("text/plain", a.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDragging(a.id);
                    }}
                    onDragEnd={() => {
                      setDragging(null);
                      setOver(null);
                    }}
                    className={cn(
                      "group flex cursor-grab flex-col gap-3 rounded-xl border border-border bg-surface p-3.5 transition-[opacity,transform,box-shadow] duration-300 ease-[var(--ease-out-soft)] active:cursor-grabbing",
                      "hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-20px_rgba(21,32,27,0.5)]",
                      dragging === a.id && "scale-[0.98] opacity-40",
                      landed === a.id && "animate-[pop-in_420ms_var(--ease-spring)]",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar name={a.candidate.name} size={30} />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <Link href={routes.ranking(jobId, a.id)} className="truncate text-[13.5px] font-medium hover:text-blue" draggable={false}>
                          {a.candidate.name}
                        </Link>
                        <span className={cn("font-mono text-[11px]", score !== undefined ? scoreTone(score) : "text-ink-3")}>{score !== undefined ? `${score} de 100` : "Sin evaluar"}</span>
                      </div>
                      <GripVertical aria-hidden className="size-4 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <StatusChip status={chipFor(a)} size="sm" />
                  </article>
                );
              })}

              <div
                className={cn(
                  "mt-auto flex min-h-14 items-center justify-center rounded-xl border border-dashed px-3 text-center text-[12px] transition-[border-color,color,opacity] duration-300",
                  dragging ? "border-border-strong text-ink-2 opacity-100" : "border-transparent text-ink-3 opacity-0",
                  isOver && "border-ink text-ink",
                )}
              >
                {col.hint}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
