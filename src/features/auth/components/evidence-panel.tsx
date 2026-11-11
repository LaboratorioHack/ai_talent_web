import { Check, ExternalLink, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Panel oscuro del login. En lugar de candidatos con nombre y foto, muestra el
 * ranking tal como lo ve Criba: anonimizado. Las barras crecen y los nombres
 * aparecen tachados: eso es lo que el modelo nunca lee.
 */
const rows = [
  { rank: 1, mandatory: "4 / 4", score: 92, tone: "bg-success", width: "w-[92%]" },
  { rank: 2, mandatory: "4 / 4", score: 88, tone: "bg-success", width: "w-[88%]" },
  { rank: 3, mandatory: "4 / 4", score: 85, tone: "bg-success", width: "w-[85%]" },
  { rank: 4, mandatory: "3 / 4", score: 78, tone: "bg-warning", width: "w-[78%]" },
];

const stats = [
  { value: "1.284", label: "CVs evaluados" },
  { value: "0", label: "datos sensibles usados" },
  { value: "2,5 min", label: "por hoja de vida" },
];

export function EvidencePanel() {
  return (
    <aside className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-panel px-[72px] py-16 text-ink-inverse lg:flex">
      <div aria-hidden className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-amber/10 blur-3xl animate-breathe" />

      <div className="stagger flex max-w-[560px] flex-col gap-3 [&>*]:animate-rise">
        <h2 className="font-head text-[34px] leading-[1.15] font-semibold" style={{ "--i": 1 } as React.CSSProperties}>
          Cada puntaje apunta a la línea del CV que lo prueba.
        </h2>
        <p className="text-[15px] text-ink-muted-dark" style={{ "--i": 2 } as React.CSSProperties}>
          Sin fotos, sin edad, sin género. Solo evidencia.
        </p>
      </div>

      <div className="stagger flex flex-col gap-px rounded-xl bg-bg px-5 py-2 text-ink [&>*]:animate-rise" style={{ "--stagger-step": "110ms" } as React.CSSProperties}>
        {rows.map((row, i) => (
          <div key={row.rank} className="flex items-center gap-4 border-b border-border py-3 last:border-0" style={{ "--i": i + 3 } as React.CSSProperties}>
            <span className={cn("w-6 font-head text-[19px] font-semibold", row.rank === 1 ? "text-ink" : "text-ink-3")}>{row.rank}</span>
            <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 text-ink-3" aria-label="Foto omitida">
              <EyeOff aria-hidden className="size-3.5" />
            </span>
            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span aria-label="Nombre oculto para la IA" className="h-2.5 w-28 rounded-sm bg-ink/15" />
                <span className="font-mono text-[10.5px] text-ink-3">obligatorios {row.mandatory}</span>
              </div>
              <div className="h-[3px] w-full rounded-sm bg-border">
                <div className={cn("grow-x h-full rounded-sm", row.tone, row.width)} style={{ animationDelay: `${600 + i * 140}ms` }} />
              </div>
            </div>
            <span className={cn("font-mono text-[15px] font-semibold", row.tone === "bg-success" ? "text-success" : "text-warning")}>{row.score}</span>
          </div>
        ))}

        <div className="flex items-start gap-4 border-t border-border py-3.5" style={{ "--i": 8 } as React.CSSProperties}>
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
            <Check aria-hidden className="size-3.5" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13.5px] font-medium">Azure (AKS, DevOps)</span>
              <span className="font-mono text-[10.5px] text-ink-3">Obligatorio · 25</span>
            </div>
            <p className="text-sm text-ink">“Migración de 40 microservicios a AKS; pipelines en Azure DevOps.”</p>
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] text-blue">
              <ExternalLink aria-hidden className="size-3" />
              CV pág. 1 · 2022–2025
            </span>
          </div>
          <span className="font-mono text-[13.5px] font-semibold text-success">+25</span>
        </div>
      </div>

      <dl className="stagger flex gap-10 [&>*]:animate-rise">
        {stats.map((s, i) => (
          <div key={s.label} className="flex flex-col gap-1" style={{ "--i": i + 9 } as React.CSSProperties}>
            <dt className="order-2 text-[12.5px] text-ink-muted-dark">{s.label}</dt>
            <dd className="order-1 font-head text-[28px] font-semibold text-amber">{s.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
