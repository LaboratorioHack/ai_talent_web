import "server-only";

import { modalityLabel } from "@/shared/constants/vacancy";
import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import type { Applicant, PortalApplication, PortalJob, ResumeSummary } from "../types/portal";

/*
 * Datos del portal del postulante (ai_talent_back, CandidateSideEndpoints.cs). Todo cuelga del
 * correo de la sesión con enlace mágico: las postulaciones de esa persona en todas las empresas.
 */

type WithModality<T> = Omit<T, "modality" | "location"> & { modality: string | null; location: string | null };

const place = <T extends { modality: string | null; location: string | null }>(row: T) => ({
  ...row,
  location: row.location ?? "",
  modality: modalityLabel(row.modality) ?? "",
});

/** GET /me/applicant: nombre, correo y el área en la que más se postula. */
export function getApplicant(): Promise<Applicant> {
  return serverApi<Applicant>("/me/applicant");
}

/** GET /me/applications: sus postulaciones con la etapa, nunca puntajes. */
export async function listMyApplications(): Promise<PortalApplication[]> {
  const rows = await serverApi<WithModality<PortalApplication>[]>("/me/applications");
  return rows.map(place);
}

/** GET /me/applications/{id}; null si no es suya o no existe. */
export async function getMyApplication(id: string): Promise<PortalApplication | null> {
  try {
    return place(await serverApi<WithModality<PortalApplication>>(`/me/applications/${id}`));
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

/** GET /me/resume: su última hoja de vida como documento; null si aún no ha enviado ninguna. */
export async function getMyResume(): Promise<ResumeSummary | null> {
  try {
    return await serverApi<ResumeSummary>("/me/resume");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * GET /public/vacancies con la sesión: todas las vacantes abiertas, si ya se postuló y qué tan
 * afín es cada una a su hoja de vida según Criba AI (sin hoja de vida, `match` no viene).
 */
export async function listOpenJobs(): Promise<PortalJob[]> {
  const rows = await serverApi<(WithModality<PortalJob> & { match: PortalJob["match"] | null })[]>("/public/vacancies");
  return rows.map((row) => ({ ...place(row), match: row.match ?? undefined }));
}
