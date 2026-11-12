"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { JobStatus } from "@/shared/types/domain";
import { createVacancy } from "../api/role-profiles";
import { publishVacancy, updateVacancy } from "../api/mutations";
import type { RoleProfileDraft } from "../schemas/role-profile";
import { RoleProfileEditor } from "./role-profile-editor";

export interface VacancyProfileFormProps {
  /** Sin id: se crea una vacante nueva. */
  id?: string;
  /** Estado actual al editar: solo un borrador se publica. */
  status?: JobStatus;
  initial: RoleProfileDraft;
}

/** Pantalla 06 · Perfil de cargo, para crear o editar una vacante. */
export function VacancyProfileForm({ id, status, initial }: VacancyProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  async function save(draft: RoleProfileDraft) {
    if (id) {
      await updateVacancy(id, draft);
      toast({ title: "Perfil guardado", description: "Si ya había evaluaciones, Criba vuelve a calcular el ranking." });
      router.push(routes.vacancy(id));
    } else {
      const created = await createVacancy(draft);
      toast({ title: "Vacante creada", description: draft.title });
      router.push(routes.vacancy(created.id));
    }
  }

  async function evaluate(draft: RoleProfileDraft) {
    const target = id ?? (await createVacancy(draft)).id;
    if (id) await updateVacancy(id, draft);
    if (!id || status === "DRAFT") {
      try {
        await publishVacancy(target);
      } catch (error) {
        // Ya quedó guardada como borrador: se sigue en su editor para no crearla dos veces.
        if (!id) router.replace(routes.vacancyEdit(target));
        throw error;
      }
    }
    toast({ title: "Vacante publicada", description: "Comparte el enlace para que las personas se postulen." });
    router.push(`${routes.candidates}?job=${target}`);
  }

  return (
    <RoleProfileEditor
      initial={initial}
      eyebrow={id ? "Vacantes, editar perfil" : "Vacantes, nueva"}
      onSave={save}
      onEvaluate={evaluate}
      saveLabel={id ? "Guardar cambios" : "Guardar borrador"}
      evaluateLabel="Publicar y compartir"
    />
  );
}
