"use client";

import type { ReactNode } from "react";
import { useLinkStatus } from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";

/**
 * Icono de un enlace que, mientras abre su destino, se cambia por un giro
 * corto en el mismo lugar (sin mover nada). Va dentro de un `<Link>`.
 */
export function LinkPending({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span className="link-hint inline-flex" data-pending={pending}>
        {children}
      </span>
      <Loader2
        aria-hidden
        className="link-spin size-4 animate-spin text-amber"
        data-pending={pending}
      />
    </span>
  );
}
