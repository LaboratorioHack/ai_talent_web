"use client";

import { CloudOff, RotateCcw } from "lucide-react";
import { Button, ButtonLink, EmptyState } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

/**
 * Error de una pantalla del panel. Mantiene la barra para seguir navegando:
 * con backend, Inicio, Ranking, Entrevistas y Gobierno aún no tienen endpoints.
 */
export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-12">
      <EmptyState
        icon={CloudOff}
        title="No pudimos cargar esta pantalla"
        description="Esta parte puede no estar conectada todavía al backend, o la API no respondió. Las vacantes sí funcionan."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" icon={<RotateCcw />} onClick={reset}>
              Reintentar
            </Button>
            <ButtonLink href={routes.vacancies}>Ver vacantes</ButtonLink>
          </div>
        }
      />
    </div>
  );
}
