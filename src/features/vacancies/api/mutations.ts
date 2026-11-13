import { browserApi } from "@/shared/lib/api-browser";
import { PIPELINE_TO_API } from "@/shared/lib/vacancy-api";
import type { PipelineStage } from "@/shared/types/domain";
import type { RoleProfileDraft } from "../schemas/role-profile";
import { toProfileRequest, toVacancyFields } from "./contracts";

/** Cambios que hace el navegador sobre vacantes. */

/** Datos de la vacante y su perfil van por rutas distintas: PATCH /vacancies/{id} y PUT /vacancies/{id}/profile. */
export async function updateVacancy(id: string, draft: RoleProfileDraft): Promise<void> {
  await browserApi(`/vacancies/${id}`, { method: "PATCH", body: JSON.stringify(toVacancyFields(draft)) });
  await browserApi(`/vacancies/${id}/profile`, { method: "PUT", body: JSON.stringify(toProfileRequest(draft)) });
}

/** Pasa un borrador a abierta. La API exige al menos un requisito y pesos que sumen 100. */
export async function publishVacancy(id: string): Promise<void> {
  await browserApi(`/vacancies/${id}/publish`, { method: "POST" });
}

/** Pasa una vacante abierta a cerrada: nadie más se postula y su ranking se conserva. */
export async function closeVacancy(id: string): Promise<void> {
  await browserApi(`/vacancies/${id}/close`, { method: "POST" });
}

export async function deleteVacancy(id: string): Promise<void> {
  await browserApi(`/vacancies/${id}`, { method: "DELETE" });
}

/**
 * Cambia de etapa una postulación: PATCH /vacancies/{id}/applications/{applicationId}.
 * La API avanza de a una etapa (o retrocede una para deshacer) y lo deja en la auditoría.
 */
export async function moveApplication(vacancyId: string, applicationId: string, stage: PipelineStage, reason?: string): Promise<void> {
  await browserApi(`/vacancies/${vacancyId}/applications/${applicationId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: PIPELINE_TO_API[stage], reason }),
  });
}
