"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button, Modal, TextField, useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import { deleteVacancy } from "../api/mutations";

export interface DeleteVacancyProps {
  id: string;
  title: string;
  evaluations: number;
}

/** Botón y modal para eliminar una vacante. Pide escribir el nombre para confirmar. */
export function DeleteVacancy({ id, title, evaluations }: DeleteVacancyProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const matches = confirm.trim().toLowerCase() === title.toLowerCase();

  async function remove() {
    setBusy(true);
    try {
      await deleteVacancy(id);
      toast({ title: "Vacante eliminada", description: title });
      router.push(routes.vacancies);
    } catch {
      toast({ tone: "error", title: "No se pudo eliminar la vacante" });
      setBusy(false);
    }
  }

  return (
    <>
      <Button variant="text" icon={<Trash2 />} onClick={() => setOpen(true)} className="text-danger hover:text-danger">
        Eliminar
      </Button>
      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setConfirm("");
        }}
        dismissible={!busy}
        title="Eliminar la vacante"
        description={`Deja de aparecer en tus vacantes y su enlace ya no recibe postulaciones. Sus ${evaluations} evaluaciones y la auditoría se conservan. No se puede deshacer desde Criba.`}
        footer={
          <>
            <Button variant="text" disabled={busy} onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" icon={<Trash2 />} disabled={!matches} loading={busy} onClick={remove}>
              Eliminar vacante
            </Button>
          </>
        }
      >
        <TextField label={`Escribe "${title}" para confirmar`} value={confirm} onChange={(e) => setConfirm(e.target.value)} validated={matches} autoComplete="off" />
      </Modal>
    </>
  );
}
