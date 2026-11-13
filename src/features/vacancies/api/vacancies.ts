import "server-only";

import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import { toFulfillment, toJobOpening, toPipelineStage, vacanciesPath, type ApiVacancyApplication, type ApiVacancyDetail, type ApiVacancyPage } from "@/shared/lib/vacancy-api";
import type { Fulfillment, JobOpening, PipelineStage } from "@/shared/types/domain";
import { emptyListing, type RoleProfileDraft } from "../schemas/role-profile";

/** Vacantes de la organización activa: GET /vacancies. */
export async function listVacancies(): Promise<JobOpening[]> {
  const page = await serverApi<ApiVacancyPage>(vacanciesPath);
  return page.items.map((v) => toJobOpening(v));
}

/** Una vacante; null si no existe o es de otra organización: GET /vacancies/{id}. */
export async function getVacancy(id: string): Promise<JobOpening | null> {
  try {
    return toJobOpening(await serverApi<ApiVacancyDetail>(`/vacancies/${id}`));
  } catch (error) {
    // La API responde 404 tanto si no existe como si es de otra organización.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Tarjeta del tablero: lo justo para decidir si mover a alguien de etapa. */
export interface PipelineCard {
  id: string;
  name: string;
  stage: PipelineStage;
  score?: number;
  fulfillment?: Fulfillment;
  /** Estado de la lectura o lo que dijo la evaluación. */
  note?: string;
  source: "Se postuló";
}

const FULFILLMENT_NOTE: Record<Fulfillment, string> = {
  MEETS: "Cumple lo obligatorio",
  PARTIAL: "Cumple parcialmente",
  DOES_NOT_MEET: "No cumple lo obligatorio",
};

function noteOf(a: ApiVacancyApplication, fulfillment: Fulfillment | undefined): string | undefined {
  if (a.processingStatus === "FAILED") return "No se pudo leer la hoja de vida";
  if (a.processingStatus === "PENDING" || a.processingStatus === "PROCESSING") return "Leyendo la hoja de vida";
  if (fulfillment) return FULFILLMENT_NOTE[fulfillment];
  return undefined;
}

/** Tablero de una vacante: sus postulaciones por etapa, con la última evaluación. GET /vacancies/{id}/applications. */
export async function getPipeline(id: string): Promise<PipelineCard[]> {
  try {
    const applications = await serverApi<ApiVacancyApplication[]>(`/vacancies/${id}/applications`);
    return applications.flatMap((a) => {
      const fulfillment = toFulfillment(a.fulfillment);
      const stage = toPipelineStage(a.selectionStatus, fulfillment !== undefined && fulfillment !== "MEETS");
      if (!stage) return [];
      return [{ id: a.applicationId, name: a.candidateName, stage, score: a.score ?? undefined, fulfillment, note: noteOf(a, fulfillment), source: "Se postuló" as const }];
    });
  } catch (error) {
    // La página ya muestra el 404 de la vacante; el tablero solo queda vacío.
    if (error instanceof ApiError && error.status === 404) return [];
    throw error;
  }
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
    listing: v.listing ?? emptyListing(),
  };
}
