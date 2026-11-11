import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockApplications, mockVacancies } from "@/shared/mocks";
import type { Application, JobOpening } from "@/shared/types/domain";
import type { RoleProfileDraft } from "../schemas/role-profile";

/** Vacantes de la organización activa. Con backend: GET /vacancies. */
export async function listVacancies(): Promise<JobOpening[]> {
  if (!env.useMocks) return apiFetch<JobOpening[]>("/vacancies");
  return delay(mockVacancies);
}

/** Una vacante; null si no existe o es de otra organización. Con backend: GET /vacancies/{id}. */
export async function getVacancy(id: string): Promise<JobOpening | null> {
  if (!env.useMocks) return apiFetch<JobOpening>(`/vacancies/${id}`).catch(() => null);
  return delay(mockVacancies.find((v) => v.id === id) ?? null);
}

/** Postulaciones de una vacante con su etapa del pipeline. Con backend: GET /vacancies/{id}/applications. */
export async function getPipeline(id: string): Promise<Application[]> {
  if (!env.useMocks) return apiFetch<Application[]>(`/vacancies/${id}/applications`);
  return delay(mockApplications.filter((a) => a.jobOpeningId === id));
}

/** Perfil de una vacante como borrador del editor. */
export function draftFromVacancy(v: JobOpening): RoleProfileDraft {
  return {
    title: v.title,
    description: v.profile.description,
    area: v.profile.area,
    closesAt: v.closesAt,
    openings: v.openings,
    autoInterview: v.profile.autoInterview,
    ignoreSensitive: true,
    requirements: v.profile.requirements.map((r) => ({ id: r.id, description: r.description, type: r.type, weight: r.weight, equivalences: r.equivalences })),
  };
}
