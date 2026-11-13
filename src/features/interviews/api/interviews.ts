import "server-only";

import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import type { Interview } from "@/shared/types/domain";

/** Entrevistas de la organización: GET /interviews (las canceladas no vienen). */
export function listInterviews(): Promise<Interview[]> {
  return serverApi<Interview[]>("/interviews");
}

/** Una entrevista con su transcripción y el contraste con la hoja de vida: GET /interviews/{id}. */
export async function getInterview(id: string): Promise<Interview | null> {
  try {
    return await serverApi<Interview>(`/interviews/${id}`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}
