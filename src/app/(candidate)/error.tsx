"use client";

import { RotateCcw, UserRound } from "lucide-react";
import { Button, EmptyState } from "@/shared/components/ui";

/**
 * Error del portal del postulante (incluida su barra). Con backend, la API aún
 * no sirve /me/applicant ni /me/applications: la sesión entra, pero sin datos.
 */
export default function PortalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="portal-light flex min-h-dvh flex-1 items-center justify-center px-4 py-16 sm:px-6">
      <EmptyState
        icon={UserRound}
        title="No pudimos cargar tu portal"
        description="Tu sesión está iniciada, pero no pudimos traer tus postulaciones. Intenta de nuevo en un momento."
        action={
          <Button variant="outline" icon={<RotateCcw />} onClick={reset}>
            Reintentar
          </Button>
        }
      />
    </div>
  );
}
