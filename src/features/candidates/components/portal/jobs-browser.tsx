"use client";

import { useMemo, useState } from "react";
import { EmptyState, SearchField, Segmented, Select } from "@/shared/components/ui";
import type { PortalJob } from "../../types/portal";
import { JobCard } from "./job-card";

type Modality = "all" | PortalJob["modality"];

/** Vacantes abiertas con búsqueda y filtros de modalidad y área. */
export function JobsBrowser({ jobs }: { jobs: PortalJob[] }) {
  const [query, setQuery] = useState("");
  const [modality, setModality] = useState<Modality>("all");
  const [area, setArea] = useState("all");
  const areas = useMemo(() => [...new Set(jobs.map((j) => j.area))], [jobs]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter(
      (j) =>
        (modality === "all" || j.modality === modality) &&
        (area === "all" || j.area === area) &&
        (!q || `${j.title} ${j.highlights.join(" ")} ${j.location}`.toLowerCase().includes(q)),
    );
  }, [jobs, query, modality, area]);

  const count = (m: Modality) => (m === "all" ? jobs.length : jobs.filter((j) => j.modality === m).length);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Segmented
          aria-label="Modalidad"
          value={modality}
          onChange={setModality}
          items={[
            { value: "all", label: "Todas", count: count("all") },
            { value: "Remoto", label: "Remoto", count: count("Remoto") },
            { value: "Híbrido", label: "Híbrido", count: count("Híbrido") },
            { value: "Presencial", label: "Presencial", count: count("Presencial") },
          ]}
        />
        <div className="flex w-full gap-2 lg:w-auto">
          <Select
            aria-label="Área"
            options={[{ value: "all", label: "Todas las áreas" }, ...areas.map((a) => ({ value: a, label: a }))]}
            value={area}
            onChange={setArea}
            className="w-[46%] lg:w-[200px]"
            triggerClassName="field-box h-11 w-full px-3.5 text-[13.5px] text-ink"
          />
          <SearchField placeholder="Cargo, herramienta o ciudad" containerClassName="min-w-0 flex-1 lg:w-[280px] lg:flex-none" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>
      {visible.length ? (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((j, i) => (
            <JobCard key={j.id} job={j} index={i} />
          ))}
        </ul>
      ) : (
        <EmptyState title="No hay vacantes con esos filtros" description="Prueba con otra modalidad o quita la búsqueda." className="mx-auto w-[480px] max-w-full bg-surface" />
      )}
    </div>
  );
}
