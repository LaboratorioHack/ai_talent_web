import type { ReactNode } from "react";

/**
 * Se vuelve a montar en cada navegación del panel: la pantalla nueva entra con
 * un fundido y un leve ascenso. La animación no deja transform al terminar,
 * así no rompe los elementos sticky ni los fixed de dentro.
 */
export default function DashboardTemplate({ children }: { children: ReactNode }) {
  return <div className="flex flex-1 flex-col animate-[page-in_520ms_var(--ease-out-soft)_backwards]">{children}</div>;
}
