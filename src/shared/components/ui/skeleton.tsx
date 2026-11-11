import { cn } from "@/shared/lib/cn";

/** Bloque de carga que respira. Úsalo con la misma forma que el contenido que reemplaza. */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={cn("block rounded-md bg-surface-2 animate-breathe", className)} style={style} />;
}
