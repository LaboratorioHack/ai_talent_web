import "server-only";

import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import type { RankingData, RankingSummary, TopPerson } from "../types/ranking";

/** Ranking de una vacante con el detalle de cada evaluación: GET /vacancies/{id}/ranking. null si no existe. */
export async function getRanking(jobId: string): Promise<RankingData | null> {
  try {
    return await serverApi<RankingData>(`/vacancies/${jobId}/ranking`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

/** Resumen de todos los rankings para la portada de Ranking: GET /rankings. */
export function listRankings(): Promise<RankingSummary[]> {
  return serverApi<RankingSummary[]>("/rankings");
}

/** Las personas con mejor ajuste en todas las vacantes abiertas: GET /rankings/top. */
export function listTopPeople(): Promise<TopPerson[]> {
  return serverApi<TopPerson[]>("/rankings/top");
}
