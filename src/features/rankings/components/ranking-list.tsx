"use client";

import { useMemo, useState } from "react";
import { Avatar, SearchField, Segmented } from "@/shared/components/ui";
import { cn } from "@/shared/lib/cn";
import type { Fulfillment } from "@/shared/types/domain";
import type { RankedCandidate } from "../types/ranking";

type Filter = "all" | Fulfillment;

const BAR = { MEETS: "bg-success", PARTIAL: "bg-amber", DOES_NOT_MEET: "bg-danger" } as const;
const NUM = { MEETS: "text-success", PARTIAL: "text-warning", DOES_NOT_MEET: "text-danger" } as const;
const PAGE = 20;

export interface RankingListProps {
  candidates: RankedCandidate[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  discarded: Record<string, string>;
  dimmed?: boolean;
}

/** Lista ordenada por ajuste al perfil, con filtro por resultado y búsqueda. */
export function RankingList({ candidates, selectedId, onSelect, discarded, dimmed }: RankingListProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const count = (f: Fulfillment) => candidates.filter((c) => c.fulfillment === f).length;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.map((c, i) => ({ c, rank: i + 1 })).filter(({ c }) => (filter === "all" || c.fulfillment === filter) && (!q || c.name.toLowerCase().includes(q)));
  }, [candidates, filter, query]);

  return (
    <div className={cn("flex flex-col gap-4 transition-opacity duration-500", dimmed && "pointer-events-none opacity-40")}>
      <Segmented
        aria-label="Resultado"
        size="sm"
        fill
        value={filter}
        onChange={(f) => {
          setFilter(f);
          setLimit(PAGE);
        }}
        items={[
          { value: "all", label: "Todos", count: candidates.length },
          { value: "MEETS", label: "Cumplen", count: count("MEETS") },
          { value: "PARTIAL", label: "Parcial", count: count("PARTIAL") },
          { value: "DOES_NOT_MEET", label: "No cumple", count: count("DOES_NOT_MEET") },
        ]}
      />
      <SearchField placeholder="Buscar candidato" value={query} onChange={(e) => setQuery(e.target.value)} />

      <ol className="flex flex-col">
        {visible.slice(0, limit).map(({ c, rank }, i) => {
          const active = c.id === selectedId;
          const out = Boolean(discarded[c.id]);
          return (
            <li key={c.id} className="animate-[option-in_360ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${Math.min(i, 14) * 28}ms` }}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "relative grid w-full grid-cols-[28px_36px_1fr_36px] items-center gap-3 rounded-xl px-3 py-3 text-left transition-[background-color] duration-300",
                  active ? "bg-surface shadow-[0_1px_2px_rgba(21,32,27,0.06),0_10px_24px_-18px_rgba(21,32,27,0.45)] ring-1 ring-border" : "hover:bg-surface/70",
                )}
              >
                <span className={cn("absolute top-3 bottom-3 left-0 w-[3px] rounded-full bg-ink transition-transform duration-500 ease-[var(--ease-spring)]", active ? "scale-y-100" : "scale-y-0")} />
                <span className="text-center font-mono text-[13px] text-ink-3">{rank}</span>
                <Avatar name={c.name} size={36} className={cn(out && "opacity-50")} />
                <span className="flex min-w-0 flex-col gap-1.5">
                  <span className={cn("truncate text-[14.5px]", active ? "font-semibold" : "font-medium", out && "text-ink-3 line-through decoration-ink-3/60")}>{c.name}</span>
                  <span className="h-1 overflow-hidden rounded-full bg-surface-2">
                    <span className={cn("grow-x block h-full rounded-full", out ? "bg-border-strong" : BAR[c.fulfillment])} style={{ width: `${c.score}%`, animationDelay: `${150 + Math.min(i, 14) * 28}ms` }} />
                  </span>
                </span>
                <span className={cn("text-right font-head text-[18px] font-semibold tabular-nums", out ? "text-ink-3" : NUM[c.fulfillment])}>{c.score}</span>
              </button>
            </li>
          );
        })}
      </ol>
      {visible.length > limit ? (
        <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="self-start rounded-full px-3 py-1.5 text-[13px] text-ink-2 ring-1 ring-border transition-[color,box-shadow] hover:text-ink hover:ring-border-strong">
          Ver los {visible.length - limit} restantes
        </button>
      ) : null}
      {visible.length === 0 ? <p className="py-8 text-center text-[13.5px] text-ink-3">Nadie coincide con el filtro.</p> : null}
    </div>
  );
}
