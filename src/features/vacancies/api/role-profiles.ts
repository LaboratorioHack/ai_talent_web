import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockVacancies } from "@/shared/mocks";
import type { RoleProfileDraft } from "../schemas/role-profile";

/** Borrador que propone el onboarding: el perfil de ejemplo de Cloud Senior. */
export function exampleRoleProfileDraft(): RoleProfileDraft {
  const cloud = mockVacancies[0];
  return {
    title: cloud.title,
    area: cloud.profile.area,
    closesAt: cloud.closesAt,
    openings: cloud.openings,
    autoInterview: true,
    ignoreSensitive: true,
    requirements: cloud.profile.requirements.map((r) => ({
      id: r.id,
      description: r.description,
      type: r.type,
      weight: r.weight,
      equivalences: r.equivalences,
    })),
  };
}

export async function createVacancy(draft: RoleProfileDraft): Promise<{ id: string }> {
  if (env.useMocks) return delay({ id: "v-cloud" }, 600);
  return apiFetch<{ id: string }>("/vacancies", { method: "POST", body: JSON.stringify(draft) });
}
