"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { SearchField, Select } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import type { PortalJob } from "../../types/portal";

type Modality = "all" | PortalJob["modality"];
const MODALITIES: Modality[] = ["all", "Remoto", "Híbrido", "Presencial"];

/** Vacantes abiertas como lista: filtros arriba en una línea y una fila por cargo. */
export function JobsBrowser({ jobs }: { jobs: PortalJob[] }) {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState<Modality>("all");
  const [area, setArea] = useState("all");
  const areas = useMemo(() => [...new Set(jobs.map((j) => j.area))], [jobs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (j) => (modality === "all" || j.modality === modality) && (area === "all" || j.area === area) && (!q || `${j.title} ${j.highlights.join(" ")} ${j.location}`.toLowerCase().includes(q)),
    );
  }, [jobs, query, modality, area]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="radiogroup" aria-label="Modalidad" className="flex flex-wrap gap-2">
          {MODALITIES.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={modality === m}
              onClick={() => setModality(m)}
              className={cn(
                "h-9 rounded-full px-4 text-[13.5px] transition-[background-color,color,box-shadow] duration-300",
                modality === m ? "bg-ink text-bg" : "text-ink-2 ring-1 ring-border-strong hover:text-ink hover:ring-ink-3",
              )}
            >
              {m === "all" ? "Todas" : m}
            </button>
          ))}
        </div>
        <div className="flex w-full gap-2 lg:w-auto">
          <Select
            aria-label="Área"
            options={[{ value: "all", label: "Todas las áreas" }, ...areas.map((a) => ({ value: a, label: a }))]}
            value={area}
            onChange={setArea}
            className="w-[46%] lg:w-[190px]"
            triggerClassName="field-box h-10 w-full px-3.5 text-[13.5px] text-ink"
          />
          <SearchField placeholder="Cargo, herramienta o ciudad" containerClassName="min-w-0 flex-1 lg:w-[260px] lg:flex-none" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      {visible.length ? (
        <ul className="panel flex flex-col divide-y divide-border overflow-hidden px-4">
          {visible.map((j, i) => {
            const closes = fromISODate(j.closesAt);
            return (
              <li key={j.id} className="animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
                <Link href={routes.apply(j.id)} className="group -mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 rounded-xl px-3 py-5 transition-colors duration-300 hover:bg-hover md:grid-cols-[44px_minmax(0,1.2fr)_minmax(0,1fr)_150px_auto]">
                  <span aria-hidden className="flex size-11 items-center justify-center rounded-xl bg-surface-2 font-head text-[14px] font-semibold text-ink-2 ring-1 ring-border transition-[transform,translate,scale,rotate] duration-500 ease-[var(--ease-spring)] group-hover:-rotate-3 max-md:hidden">
                    {j.company.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate font-head text-[18px] leading-tight font-semibold tracking-[-0.01em]">{j.title}</span>
                      {j.applied ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-success">
                          <Check aria-hidden className="size-3.5" />
                          Te postulaste
                        </span>
                      ) : null}
                    </span>
                    <span className="truncate text-[13px] text-ink-3">
                      {j.company} · {j.location}, {j.modality.toLowerCase()}
                    </span>
                  </span>
                  <span className="truncate text-[13.5px] text-ink-2 max-md:col-span-2 max-md:row-start-2">{j.highlights.join(" · ")}</span>
                  <span className="text-[13px] text-ink-3 max-md:hidden">{closes ? `Hasta el ${formatLongDate(closes)}` : ""}</span>
                  <ArrowUpRight aria-hidden className="size-4 text-ink-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 max-md:row-start-1 max-md:col-start-2" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="panel py-12 text-center text-[14px] text-ink-3">No hay vacantes con esos filtros.</p>
      )}
    </div>
  );
}
