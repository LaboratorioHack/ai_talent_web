import { cn } from "@/shared/lib/cn";

export interface AvatarProps {
  name: string;
  size?: number;
  className?: string;
}

const palette = ["bg-surface-2 text-ink", "bg-blue-soft text-blue", "bg-success-soft text-success", "bg-warning-soft text-warning"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Avatar solo con iniciales: Criba nunca muestra la foto del candidato
 * (IA responsable), así que no existe variante con imagen.
 */
export function Avatar({ name, size = 40, className }: AvatarProps) {
  const tone = palette[name.length % palette.length];
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-head font-semibold", tone, className)}
    >
      {initials(name)}
    </span>
  );
}
