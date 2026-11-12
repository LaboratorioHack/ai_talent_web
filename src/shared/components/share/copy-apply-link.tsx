"use client";

import { Link2 } from "lucide-react";
import { Button, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

/**
 * Copia el enlace público de la vacante. Quien lo abre ve el cargo y se
 * postula con su hoja de vida (applications.source = CANDIDATE).
 */
export function CopyApplyLink({ jobId }: { jobId: string }) {
  const { toast } = useToast();
  async function copy() {
    const url = `${window.location.origin}${routes.apply(jobId)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Enlace de postulación copiado", description: "Compártelo donde publiques la vacante.", action: { label: "Abrir", onClick: () => window.open(url, "_blank", "noopener") } });
    } catch {
      window.open(url, "_blank", "noopener");
    }
  }
  return (
    <Button variant="outline" icon={<Link2 />} onClick={copy}>
      Enlace de postulación
    </Button>
  );
}
