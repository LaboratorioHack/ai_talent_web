import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { browserApi } from "@/shared/lib/api-browser";
import { delay } from "@/shared/mocks";
import type { PipelineStage } from "@/shared/types/domain";
import type { RoleProfileDraft } from "../schemas/role-profile";
import { toProfileRequest, toVacancyFields } from "./contracts";

/** Cambios que hace el navegador sobre vacantes. Mientras no haya backend, se simulan. */

/** Datos de la vacante y su perfil van por rutas distintas: PATCH /vacancies/{id} y PUT /vacancies/{id}/profile. */
export async function updateVacancy(id: string, draft: RoleProfileDraft): Promise<void> {
  if (env.useMocks) return delay(undefined, 600);
  await browserApi(`/vacancies/${id}`, { method: "PATCH", body: JSON.stringify(toVacancyFields(draft)) });
  await browserApi(`/vacancies/${id}/profile`, { method: "PUT", body: JSON.stringify(toProfileRequest(draft)) });
}

/** Pasa un borrador a abierta. La API exige al menos un requisito y pesos que sumen 100. */
export async function publishVacancy(id: string): Promise<void> {
  if (env.useMocks) return delay(undefined, 400);
  await browserApi(`/vacancies/${id}/publish`, { method: "POST" });
}

export async function deleteVacancy(id: string): Promise<void> {
  if (env.useMocks) return delay(undefined, 700);
  await browserApi(`/vacancies/${id}`, { method: "DELETE" });
}

/** La API aún no expone el cambio de etapa de una postulación. */
export async function moveApplication(applicationId: string, stage: PipelineStage): Promise<void> {
  if (env.useMocks) return delay(undefined, 250);
  await apiFetch(`/applications/${applicationId}/stage`, { method: "PATCH", body: JSON.stringify({ stage }) });
}
