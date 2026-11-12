"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { Button, Modal, useToast } from "@/shared/components/ui";
import { closeVacancy } from "../api/mutations";

export interface CloseVacancyProps {
  id: string;
  title: string;
}

/** Botón y modal para cerrar las postulaciones de una vacante abierta. */
export function CloseVacancy({ id, title }: CloseVacancyProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function close() {
    setBusy(true);
    try {
      await closeVacancy(id);
      toast({ title: "Postulaciones cerradas", description: title });
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast({ tone: "error", title: "No se pudo cerrar la vacante", description: error instanceof Error ? error.message : undefined });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="outline" icon={<Lock />} onClick={() => setOpen(true)}>
        Cerrar postulaciones
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        dismissible={!busy}
        title="Cerrar las postulaciones"
        description="Nadie más podrá postularse con el enlace. El ranking, las postulaciones y la auditoría se conservan."
        footer={
          <>
            <Button variant="text" disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button icon={<Lock />} loading={busy} onClick={close}>
              Cerrar postulaciones
            </Button>
          </>
        }
      />
    </>
  );
}
