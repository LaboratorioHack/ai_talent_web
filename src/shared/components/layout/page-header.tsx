import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export interface PageHeaderProps {
  /** Rótulo mono en mayúsculas: "VACANTES / NUEVA", "ÚLTIMOS 30 DÍAS · BANCOLOMBIA DIGITAL". */
  eyebrow?: ReactNode;
  title: string;
  description?: ReactNode;
  /** Acciones a la derecha. Recuerda: un botón de tinta por pantalla. */
  actions?: ReactNode;
  /** Pestañas u otro contenido bajo el título. */
  children?: ReactNode;
  size?: "md" | "lg";
  className?: string;
}

export function PageHeader({ eyebrow, title, description, actions, children, size = "md", className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <div className="flex items-start justify-between gap-6">
        <div className="flex flex-col gap-1.5">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1 className={cn("font-head leading-tight font-semibold", size === "lg" ? "text-4xl" : "text-[34px]")}>{title}</h1>
          {description ? <p className="text-base text-ink-2">{description}</p> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

/** Contenedor estándar de una pantalla del panel: 36px arriba, 48px a los lados. */
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex flex-1 flex-col gap-7 px-4 sm:px-6 lg:px-12 pt-9 pb-8", className)}>{children}</div>;
}
