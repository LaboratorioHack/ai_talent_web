import { cn } from "@/shared/lib/cn";

/** Bloque de carga con un barrido de luz. Úsalo con la misma forma que el contenido que reemplaza. */
export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden className={cn("skeleton block rounded-md", className)} style={style} />;
}
