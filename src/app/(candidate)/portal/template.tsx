import type { ReactNode } from "react";

/**
 * Cada sección del portal entra con un fundido corto al cambiar de pestaña:
 * la plantilla se vuelve a montar en cada navegación. Termina sin transform.
 */
export default function PortalTemplate({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col animate-[page-in_520ms_var(--ease-out-soft)_backwards]">
      {children}
    </div>
  );
}
