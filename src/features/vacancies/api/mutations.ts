import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay } from "@/shared/mocks";
import type { PipelineStage } from "@/shared/types/domain";
import type { RoleProfileDraft } from "../schemas/role-profile";

/** Cambios que hace el navegador sobre vacantes. Mientras no haya backend, se simulan. */

export async function updateVacancy(id: string, draft: RoleProfileDraft): Promise<void> {
  if (env.useMocks) return delay(undefined, 600);
  await apiFetch(`/vacancies/${id}`, { method: "PUT", body: JSON.stringify(draft) });
}

export async function deleteVacancy(id: string): Promise<void> {
  if (env.useMocks) return delay(undefined, 700);
  await apiFetch(`/vacancies/${id}`, { method: "DELETE" });
}

export async function moveApplication(applicationId: string, stage: PipelineStage): Promise<void> {
  if (env.useMocks) return delay(undefined, 250);
  await apiFetch(`/applications/${applicationId}/stage`, { method: "PATCH", body: JSON.stringify({ stage }) });
}
