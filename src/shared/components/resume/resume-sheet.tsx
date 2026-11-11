import { cn } from "@/shared/lib/cn";
import type { ResumeDoc } from "@/shared/types/resume-doc";

export interface ResumeSheetProps {
  doc: ResumeDoc;
  /** Muestra la columna de revisión con las notas de cada requisito. */
  annotated?: boolean;
  /** Puntaje total en la cabecera del margen. */
  score?: number;
  /**
   * Revela resaltador y notas línea a línea al montar (login, previsualizaciones).
   * Sin esto, todo aparece ya marcado.
   */
  reveal?: boolean;
  /** Texto más pequeño para vistas compactas. */
  compact?: boolean;
  className?: string;
}

/**
 * Una hoja de vida como documento en papel (serif de documento, secciones en
 * versalitas, fechas a la derecha). Con `annotated`, el margen derecho lleva la
 * revisión de Criba: qué requisito prueba cada línea y cuántos puntos aporta.
 */
export function ResumeSheet({ doc, annotated = false, score, reveal = false, compact = false, className }: ResumeSheetProps) {
  let noteIndex = 0;
  return (
    <article
      className={cn(
        "paper cv relative overflow-hidden rounded-[2px] text-left",
        "shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_24px_40px_-18px_rgba(0,0,0,0.65),0_70px_120px_-50px_rgba(0,0,0,0.9)]",
        reveal && "reveal-sheet",
        className,
      )}
      aria-label={`Hoja de vida de ${doc.name}`}
    >
      {/* Esquina doblada */}
      <span aria-hidden className="absolute top-0 right-0 size-8 rounded-bl-[3px] bg-[linear-gradient(225deg,var(--bg)_50%,#ddd6c6_50%,#f0ebe0_100%)] shadow-[-3px_3px_6px_-2px_rgba(0,0,0,0.25)]" />
      {annotated ? <span aria-hidden className="absolute inset-y-0 right-[230px] hidden border-l border-dashed border-border md:block" /> : null}

      <div className={cn(compact ? "px-8 pt-8 pb-9" : "px-4 sm:px-6 lg:px-10 pt-11 pb-12 sm:px-14", annotated && "md:pr-0")}>
        <header className={cn("grid gap-4 pb-2", annotated && "md:grid-cols-[1fr_230px]")}>
          <div className="flex flex-col items-center text-center">
            <p className={cn("leading-tight font-bold tracking-wide", compact ? "text-[22px]" : "text-[26px]")}>{doc.name}</p>
            <p className="mt-1 text-[14px] text-ink-2 italic">{doc.headline}</p>
            <p className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-0.5 text-[12px] text-ink-3">
              {doc.contact.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </p>
          </div>
          {annotated ? (
            <div className="hidden flex-col items-end gap-1 px-6 font-sans md:flex">
              <span className="text-[11px] text-ink-3">Revisión de Criba</span>
              {score !== undefined ? (
                <span className="font-head text-[26px] leading-none font-semibold tabular-nums">
                  {score}
                  <span className="ml-0.5 text-[12px] font-normal text-ink-3">/100</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </header>

        {doc.sections.map((section) => (
          <section key={section.title} className="mt-5">
            <h4 className={cn("grid", annotated && "md:grid-cols-[1fr_230px]")}>
              <span className="cv-heading">{section.title}</span>
            </h4>
            <ul className="mt-1.5 flex flex-col">
              {section.lines.map((line, i) => {
                const order = line.note ? noteIndex++ : 0;
                return (
                  <li
                    key={i}
                    style={{ "--n": order } as React.CSSProperties}
                    className={cn(
                      "grid items-center",
                      annotated && "md:grid-cols-[1fr_230px]",
                      line.kind === "role" ? "pt-2 pb-0.5" : "py-[3px]",
                      line.note && "evidence",
                    )}
                  >
                    <span className="flex min-w-0 items-baseline gap-3">
                      {line.kind === "bullet" ? <span aria-hidden className="ml-1 size-1 shrink-0 self-center rounded-full bg-ink-2" /> : null}
                      <span className={cn("min-w-0 leading-snug", compact ? "text-[13px]" : "text-[14px]", line.kind === "role" ? "font-bold" : "text-ink-2")}>
                        <span className={cn(line.note && "marker")}>{line.text}</span>
                      </span>
                      {annotated && line.note ? (
                        <span aria-hidden className="leader ml-1 hidden h-px min-w-6 flex-1 self-center bg-[linear-gradient(to_right,var(--ink-3)_50%,transparent_50%)] bg-[length:6px_1px] opacity-60 md:block" />
                      ) : null}
                      {line.right ? <span className={cn("shrink-0 text-[13px] text-ink-3 italic", !line.note && "ml-auto")}>{line.right}</span> : null}
                    </span>
                    {annotated ? (
                      <span className="hidden px-6 font-sans md:block">
                        {line.note ? (
                          <span className="note flex items-center justify-between gap-3 text-[12px]">
                            <span className="min-w-0 truncate">{line.note.requirement}</span>
                            <span className={cn("shrink-0 font-semibold tabular-nums", line.note.partial ? "text-warning" : "text-success")}>+{line.note.points}</span>
                          </span>
                        ) : null}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </article>
  );
}
