import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockInterviews } from "@/shared/mocks";
import type { Interview } from "@/shared/types/domain";

const all = () => mockInterviews;

/** Entrevistas de la organización. Con backend: GET /interviews. */
export async function listInterviews(): Promise<Interview[]> {
  if (!env.useMocks) return apiFetch<Interview[]>("/interviews");
  return delay(all());
}

/** Una entrevista con su transcripción y el contraste con la hoja de vida. Con backend: GET /interviews/{id}. */
export async function getInterview(id: string): Promise<Interview | null> {
  if (!env.useMocks) return apiFetch<Interview>(`/interviews/${id}`).catch(() => null);
  return delay(all().find((i) => i.id === id) ?? null);
}
