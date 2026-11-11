import { cn } from "@/shared/lib/cn";

export interface LogoMarkProps {
  /** Alto en px; el ancho sale de la proporción de la hoja. */
  size?: number;
  /** Para fondos oscuros: hoja clara con líneas de tinta. */
  inverse?: boolean;
  className?: string;
}

/**
 * Marca de Criba: una hoja con la esquina doblada y una línea marcada con el
 * resaltador ámbar. Es lo que hace el producto: leer la hoja de vida completa
 * y señalar la línea que prueba cada requisito.
 */
export function LogoMark({ size = 26, inverse = false, className }: LogoMarkProps) {
  const page = inverse ? "#f5f1e8" : "var(--ink)";
  const fold = inverse ? "#d9d2c3" : "#3b4842";
  const line = inverse ? "#15201b" : "#ffffff";
  return (
    <svg viewBox="0 0 24 28" width={(size * 24) / 28} height={size} aria-hidden className={cn("shrink-0", className)}>
      <path d="M4 1h11.2L22 7.8V24a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V4a3 3 0 0 1 3-3Z" fill={page} />
      <path d="M15.2 1v4.3a2.5 2.5 0 0 0 2.5 2.5H22" fill={fold} />
      <rect x="5" y="10.5" width="9" height="2" rx="1" fill={line} opacity="0.5" />
      <rect x="3.6" y="14.6" width="15.2" height="4.4" rx="1.3" fill="#f2a93b" />
      <rect x="5" y="15.8" width="12" height="2" rx="1" fill="#15201b" />
      <rect x="5" y="21.2" width="7" height="2" rx="1" fill={line} opacity="0.5" />
    </svg>
  );
}

export interface LogoProps {
  /** Oculta el nombre y deja solo la marca. */
  compact?: boolean;
  /** Para fondos oscuros. */
  inverse?: boolean;
  /** lg para la barra superior de la app. */
  size?: "md" | "lg";
  className?: string;
}

export function Logo({ compact = false, inverse = false, size = "md", className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center", size === "lg" ? "gap-2.5" : "gap-2", className)} aria-label="Criba">
      <LogoMark size={size === "lg" ? 30 : 26} inverse={inverse} />
      {compact ? null : (
        <span className={cn("font-head font-semibold tracking-[-0.02em]", size === "lg" ? "text-[22px]" : "text-lg", inverse ? "text-ink-inverse" : "text-ink")}>criba</span>
      )}
    </span>
  );
}
