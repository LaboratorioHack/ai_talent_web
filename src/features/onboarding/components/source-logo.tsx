import { Upload } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import type { SourceDef } from "../sources";

/** Logo oficial de la fuente en un cuadro blanco tipo icono de app. */
export function SourceLogo({ source, size = 40, className }: { source: SourceDef; size?: number; className?: string }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[10px] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)]",
        source.logo ? "bg-white p-[6px]" : "bg-surface-2 text-ink",
        className,
      )}
    >
      {source.logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- icono estático pequeño de public/, no necesita optimización
        <img src={`/logos/${source.logo}.png`} alt="" width={size - 12} height={size - 12} className="size-full object-contain" />
      ) : (
        <Upload aria-hidden className="size-[45%]" />
      )}
    </span>
  );
}
