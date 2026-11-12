import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockApplications, mockCandidatesOf, mockRequirementsOf, mockVacancies } from "@/shared/mocks";
import type { Fulfillment, JobOpening, PipelineStage } from "@/shared/types/domain";
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

/** Tarjeta del tablero: lo justo para decidir si mover a alguien de etapa. */
export interface PipelineCard {
  id: string;
  name: string;
  stage: PipelineStage;
  score?: number;
  fulfillment?: Fulfillment;
  /** Lo más fuerte de su hoja de vida, o lo que falta. */
  note?: string;
  source: "Se postuló";
}

const NEW_NAMES = ["Martín Quiroga", "Ximena Patiño", "Óscar Lozano", "Renata Gómez", "Samuel Ibarra", "Antonia Vélez", "Iván Becerra", "Luisa Chaparro"];

/** Tablero de una vacante: todas sus postulaciones por etapa. Con backend: GET /vacancies/{id}/applications. */
export async function getPipeline(id: string): Promise<PipelineCard[]> {
  if (!env.useMocks) return apiFetch<PipelineCard[]>(`/vacancies/${id}/applications`);
  const job = mockVacancies.find((v) => v.id === id);
  if (!job || !job.stats.received) return delay([]);

  const reqs = mockRequirementsOf(job);
  const short = (rid: string) => reqs.find((r) => r.id === rid)?.description ?? "";
  const fixed = new Map(mockApplications.filter((a) => a.jobOpeningId === id).map((a) => [a.id, a.stage]));
  const ranked = mockCandidatesOf(job, reqs);
  let finalists = job.stats.finalist - [...fixed.values()].filter((s) => s === "finalist").length;
  let interviews = job.stats.interview - [...fixed.values()].filter((s) => s === "interview").length;

  const cards: PipelineCard[] = ranked.map((c) => {
    let stage: PipelineStage = fixed.get(c.id) ?? (c.fulfillment === "MEETS" ? "meets" : "evaluated");
    if (!fixed.has(c.id) && c.fulfillment === "MEETS" && finalists > 0) {
      stage = "finalist";
      finalists--;
    } else if (!fixed.has(c.id) && c.fulfillment !== "DOES_NOT_MEET" && interviews > 0) {
      stage = "interview";
      interviews--;
    }
    const best = c.results.filter((r) => r.result === "MEETS").sort((x, y) => y.score - x.score)[0];
    const gap = c.results.find((r) => r.result === "DOES_NOT_MEET" || r.result === "PARTIAL");
    return {
      id: c.id,
      name: c.name,
      stage,
      score: c.score,
      fulfillment: c.fulfillment,
      note: c.fulfillment === "MEETS" ? (best ? short(best.requirementId) : undefined) : gap ? `Falta: ${short(gap.requirementId)}` : undefined,
      source: "Se postuló",
    };
  });
  const pending = Math.max(0, job.stats.received - job.stats.read);
  for (let i = 0; i < Math.max(pending, id === "v-cloud" ? 1 : 0); i++) {
    cards.push({ id: `${id}-new${i}`, name: NEW_NAMES[(i + id.length) % NEW_NAMES.length], stage: "received", source: "Se postuló" });
  }
  return delay(cards);
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
