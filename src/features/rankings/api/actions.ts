import { browserApi } from "@/shared/lib/api-browser";
import { REQUIREMENT_TYPE_FROM_API, type ApiVacancyDetail } from "@/shared/lib/vacancy-api";
import type { Equivalence } from "@/shared/types/domain";

/** Acciones del ranking (ai_talent_back, CandidateSideEndpoints.cs y VacancyEndpoints.cs). */

export type InterviewLanguage = "es" | "es-en" | "en";

export interface InterviewInvitation {
  interviewId: string;
  link: string;
  /** "AAAA-MM-DD" */
  expiresAt: string;
  questions: number;
  emailSent: boolean;
}

/**
 * Invita a la entrevista con IA: POST /vacancies/{id}/applications/{applicationId}/interview.
 * Las preguntas salen de lo que la evaluación no pudo confirmar; la persona recibe el enlace por correo.
 */
export function inviteToInterview(vacancyId: string, applicationId: string, deadline: Date, language: InterviewLanguage): Promise<InterviewInvitation> {
  const end = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate(), 23, 59, 59);
  return browserApi<InterviewInvitation>(`/vacancies/${vacancyId}/applications/${applicationId}/interview`, {
    method: "POST",
    body: JSON.stringify({ expiresAt: end.toISOString(), language, notify: true }),
  });
}

export type AiErrorKind = "equivalence" | "missed" | "years" | "citation";

/** Marca un error de la IA: queda en la auditoría y cuenta en Gobierno IA. */
export async function flagAiError(vacancyId: string, applicationId: string, kind: AiErrorKind, requirementId: string | null): Promise<void> {
  await browserApi(`/vacancies/${vacancyId}/applications/${applicationId}/ai-error`, { method: "POST", body: JSON.stringify({ kind, requirementId }) });
}

/**
 * Cambia las equivalencias de un requisito: vuelve a guardar el perfil completo con PUT /vacancies/{id}/profile
 * (si el perfil ya se usó en evaluaciones, la API crea una versión nueva y las anteriores no cambian).
 */
export async function saveEquivalences(vacancyId: string, requirementId: string, list: Equivalence[]): Promise<void> {
  const vacancy = await browserApi<ApiVacancyDetail>(`/vacancies/${vacancyId}`);
  const requirements = vacancy.requirements.map((r) => ({
    type: r.type,
    category: r.category,
    description: r.description,
    condition: r.condition,
    weight: REQUIREMENT_TYPE_FROM_API[r.type] === "DISQUALIFYING" ? 0 : r.weight,
    equivalences: r.id === requirementId ? Object.fromEntries(list.filter((e) => e.percent > 0).map((e) => [e.label, e.percent])) : (r.equivalences ?? {}),
  }));
  await browserApi(`/vacancies/${vacancyId}/profile`, { method: "PUT", body: JSON.stringify({ description: vacancy.description, requirements }) });
}
