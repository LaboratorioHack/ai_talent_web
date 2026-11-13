import { env } from "@/config/env";
import { browserApi } from "@/shared/lib/api-browser";
import { delay, mockVacancies } from "@/shared/mocks";
import type { RequirementDraft, RoleProfileDraft } from "../schemas/role-profile";
import type { ApiVacancyDetail } from "@/shared/lib/vacancy-api";
import { toProfileRequest, toVacancyFields } from "./contracts";

/** Borrador que propone el onboarding: el perfil de ejemplo de Cloud Senior. */
export function exampleRoleProfileDraft(): RoleProfileDraft {
  const cloud = mockVacancies[0];
  return {
    title: cloud.title,
    description:
      "Buscamos una persona que lidere la plataforma cloud del banco: migración de servicios a Azure, operación de Kubernetes en producción e infraestructura como código. Trabajará con equipos de desarrollo y seguridad, y con un equipo distribuido en inglés.",
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

/** Crea la vacante como borrador (DRAFT) con su perfil y requisitos. Con backend: POST /vacancies. */
export async function createVacancy(draft: RoleProfileDraft): Promise<{ id: string }> {
  if (env.useMocks) return delay({ id: "v-cloud" }, 600);
  const created = await browserApi<ApiVacancyDetail>("/vacancies", { method: "POST", body: JSON.stringify({ ...toVacancyFields(draft), ...toProfileRequest(draft) }) });
  return { id: created.id };
}

/**
 * Propone requisitos a partir de la descripción del cargo. Con backend:
 * POST /role-profiles/propose (AI Engine). Mientras tanto devuelve sugerencias fijas.
 */
export async function proposeRequirements(description: string): Promise<RequirementDraft[]> {
  if (!env.useMocks) return browserApi<RequirementDraft[]>("/role-profiles/propose", { method: "POST", body: JSON.stringify({ description }) });
  const stamp = Date.now();
  return delay(
    [
      { id: `sug-${stamp}-1`, description: "Seguridad en la nube (IAM, redes)", type: "NICE_TO_HAVE", weight: 5, equivalences: [] },
      { id: `sug-${stamp}-2`, description: "Monitoreo con Prometheus o Grafana", type: "NICE_TO_HAVE", weight: 5, equivalences: [{ label: "Datadog", percent: 80 }] },
    ],
    1200,
  );
}

/** Borrador vacío para una vacante nueva (cierre por defecto en 30 días lo fija el editor). */
export function emptyRoleProfileDraft(): RoleProfileDraft {
  return {
    title: "",
    description: "",
    area: "",
    closesAt: "",
    openings: 1,
    autoInterview: true,
    ignoreSensitive: true,
    requirements: [
      { id: "new-1", description: "", type: "MANDATORY", weight: 50, equivalences: [] },
      { id: "new-2", description: "", type: "NICE_TO_HAVE", weight: 50, equivalences: [] },
    ],
  };
}
