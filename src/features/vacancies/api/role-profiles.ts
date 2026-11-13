import { env } from "@/config/env";
import { ApiError } from "@/shared/lib/api-client";
import { browserApi } from "@/shared/lib/api-browser";
import { delay, mockVacancies } from "@/shared/mocks";
import type { Equivalence } from "@/shared/types/domain";
import type { RequirementDraft, RoleProfileDraft } from "../schemas/role-profile";
import { REQUIREMENT_TYPE_FROM_API, REQUIREMENT_TYPE_TO_API, type ApiRequirementType, type ApiVacancyDetail } from "@/shared/lib/vacancy-api";
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

interface ApiProposedRequirement {
  description: string;
  type: ApiRequirementType;
  weight: number;
  equivalences: Equivalence[];
}

let seq = 0;

const fromProposed = (r: ApiProposedRequirement): RequirementDraft => {
  const type = REQUIREMENT_TYPE_FROM_API[r.type];
  return { id: `sug-${Date.now()}-${seq++}`, description: r.description, type, weight: type === "DISQUALIFYING" ? null : r.weight, equivalences: r.equivalences };
};

/** Lo que la IA necesita del editor: la descripción y el contexto del cargo. */
export type ProfileContext = Pick<RoleProfileDraft, "title" | "area" | "description">;

/**
 * Propone requisitos a partir de la descripción del cargo: POST /role-profiles/propose.
 * Manda los ya escritos para que no se repitan y los pesos nuevos completen hasta 100.
 */
export async function proposeRequirements(context: ProfileContext, written: RequirementDraft[]): Promise<RequirementDraft[]> {
  if (!env.useMocks) {
    const body = {
      description: context.description.trim(),
      title: context.title.trim() || null,
      area: context.area || null,
      existing: written.map((r) => ({ description: r.description.trim(), type: REQUIREMENT_TYPE_TO_API[r.type], weight: r.type === "DISQUALIFYING" ? 0 : (r.weight ?? 0) })),
    };
    const result = await browserApi<{ requirements: ApiProposedRequirement[] }>("/role-profiles/propose", { method: "POST", body: JSON.stringify(body) });
    return result.requirements.map(fromProposed);
  }
  const stamp = Date.now();
  return delay(
    [
      { id: `sug-${stamp}-1`, description: "Seguridad en la nube (IAM, redes)", type: "NICE_TO_HAVE", weight: 5, equivalences: [] },
      { id: `sug-${stamp}-2`, description: "Monitoreo con Prometheus o Grafana", type: "NICE_TO_HAVE", weight: 5, equivalences: [{ label: "Datadog", percent: 80 }] },
    ],
    1200,
  );
}

/** Equivalencias para un requisito: POST /role-profiles/equivalences. No repite las que ya tiene. */
export async function suggestEquivalences(requirement: string, context: Pick<ProfileContext, "title" | "description">, existing: string[]): Promise<Equivalence[]> {
  if (!env.useMocks) {
    const body = { requirement: requirement.trim(), title: context.title.trim() || null, description: context.description.trim() || null, existing };
    const result = await browserApi<{ equivalences: Equivalence[] }>("/role-profiles/equivalences", { method: "POST", body: JSON.stringify(body) });
    return result.equivalences;
  }
  return delay([{ label: `Experiencia similar a ${requirement.trim()}`, percent: 60 }], 900);
}

/** Mensajes legibles para los errores de la IA del editor. */
export function profileAssistErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Revisa tu conexión e inténtalo de nuevo.";
  if (error.status === 503) return "Criba AI no está disponible en este momento. Intenta de nuevo en unos minutos.";
  if (error.status === 400) return "Criba no pudo leer la descripción. Revisa que cuente qué hará la persona y qué necesita saber.";
  if (error.status === 403) return "Tu cuenta todavía no pertenece a una empresa.";
  if (error.status === 404) return "La API aún no tiene esta función. Actualiza el backend.";
  return "Inténtalo de nuevo en un momento.";
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
