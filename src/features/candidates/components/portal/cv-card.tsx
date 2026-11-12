"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, PencilLine } from "lucide-react";
import { PdfFirstPage } from "@/shared/components/pdf/pdf-viewer";
import { CribaAi } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { formatLongDate, fromISODate } from "@/shared/lib/dates";
import { resumeToPdf } from "@/shared/lib/resume-pdf";
import type { ResumeSummary } from "../../types/portal";

/**
 * La hoja de vida en el inicio: miniatura real del PDF (la primera página,
 * recortada), el archivo y lo que Criba AI encontró en ella, que es con lo
 * que elige las vacantes para ti.
 */
export function CvCard({ resume }: { resume: ResumeSummary }) {
  const [bytes, setBytes] = useState<Uint8Array | null>(null);
  const updated = fromISODate(resume.updatedAt);

  useEffect(() => {
    let cancelled = false;
    resumeToPdf(resume.doc).then((r) => !cancelled && setBytes(r.bytes));
    return () => {
      cancelled = true;
    };
  }, [resume.doc]);

  return (
    <section className="panel flex flex-col overflow-hidden">
      <Link href={routes.portalResume} aria-label="Abrir tu hoja de vida" className="group relative block h-[230px] overflow-hidden border-b border-border bg-surface-2/60">
        <div className="absolute top-5 left-1/2 -translate-x-1/2 shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_20px_40px_-20px_rgba(0,0,0,0.6)] transition-[transform,translate,scale,rotate] duration-700 ease-[var(--ease-out-soft)] group-hover:-translate-y-1.5 group-hover:scale-[1.02]">
          <PdfFirstPage data={bytes} width={236} />
        </div>
        <span aria-hidden className="absolute top-5 left-1/2 h-[230px] w-[236px] -translate-x-1/2 overflow-hidden">
          <span className="ai-scan" />
        </span>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[12.5px] font-medium text-bg opacity-0 transition-[opacity,transform,translate] duration-300 group-hover:-translate-y-0.5 group-hover:opacity-100">
          <Eye aria-hidden className="size-3.5" />
          Abrir PDF
        </span>
      </Link>

      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-3">
          <span className="rounded-[4px] bg-danger px-1.5 py-0.5 font-mono text-[9.5px] font-bold text-white">PDF</span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-[13.5px] font-medium">{resume.fileName}</span>
            <span className="text-[12px] text-ink-3">Actualizada el {updated ? formatLongDate(updated) : resume.updatedAt}</span>
          </span>
          <Link href={routes.portalResume} className="flex size-9 items-center justify-center rounded-full text-ink-2 ring-1 ring-border transition-colors hover:text-ink hover:ring-border-strong" aria-label="Editar tu hoja de vida">
            <PencilLine aria-hidden className="size-4" />
          </Link>
        </div>
        <div className="flex flex-col gap-2.5">
          <CribaAi label="leyó tu hoja de vida y encontró" className="self-start" />
          <ul className="flex flex-wrap gap-1.5">
            {resume.skills.map((s, i) => (
              <li key={s} className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] text-ink-2 ring-1 ring-border animate-[pop-in_420ms_var(--ease-spring)_both]" style={{ animationDelay: `${500 + i * 110}ms` }}>
                {s}
              </li>
            ))}
          </ul>
          <p className="text-[12px] text-ink-3">Con esto te recomienda vacantes. Si algo falta, edítalo en tu hoja de vida.</p>
        </div>
      </div>
    </section>
  );
}
