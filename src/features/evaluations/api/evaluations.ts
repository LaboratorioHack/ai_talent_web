import { browserApi } from "@/shared/lib/api-browser";
import type {
  ApplicationComparisonResponse,
  ApplicationEvaluationResponse,
  ApplicationEvidenceResponse,
  VacancyRankingResponse,
} from "../types/api";

export async function evaluateApplication(vacancyId: string, applicationId: string): Promise<ApplicationEvaluationResponse> {
  return browserApi<ApplicationEvaluationResponse>(`/vacancies/${vacancyId}/applications/${applicationId}/evaluate`, { method: "POST" });
}

export async function rankVacancy(vacancyId: string, applicationIds?: string[]): Promise<VacancyRankingResponse> {
  const body = applicationIds?.length ? JSON.stringify({ applicationIds }) : undefined;
  return browserApi<VacancyRankingResponse>(`/vacancies/${vacancyId}/rank`, { method: "POST", body });
}

export async function compareApplications(vacancyId: string, applicationIds: string[]): Promise<ApplicationComparisonResponse> {
  return browserApi<ApplicationComparisonResponse>(`/vacancies/${vacancyId}/compare`, {
    method: "POST",
    body: JSON.stringify({ applicationIds }),
  });
}

export async function searchApplicationEvidence(
  vacancyId: string,
  applicationId: string,
  query: string,
  limit = 8,
): Promise<ApplicationEvidenceResponse> {
  return browserApi<ApplicationEvidenceResponse>(`/vacancies/${vacancyId}/applications/${applicationId}/evidence`, {
    method: "POST",
    body: JSON.stringify({ query, limit }),
  });
}
