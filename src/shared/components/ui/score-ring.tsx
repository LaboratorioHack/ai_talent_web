import { cn } from "@/shared/lib/cn";

export interface ScoreRingProps {
  score: number;
  size?: number;
  className?: string;
}

/** Puntaje en un anillo que se completa al aparecer. Verde ≥ 80, ámbar ≥ 60, rojo debajo. */
export function ScoreRing({ score, size = 44, className }: ScoreRingProps) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const tone = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)";
  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }} role="img" aria-label={`Puntaje ${score} de 100`}>
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="3.5" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ strokeDashoffset: c * (1 - score / 100), animation: "ring-fill 1100ms var(--ease-out-soft) both", ["--ring-from" as string]: c }}
        />
      </svg>
      <span className="font-mono text-[12.5px] font-semibold tabular-nums">{score}</span>
    </span>
  );
}
