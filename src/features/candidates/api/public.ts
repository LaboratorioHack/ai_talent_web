import "server-only";

import { ApiError, apiFetch } from "@/shared/lib/api-client";
import { modalityLabel } from "@/shared/constants/vacancy";
import { companySizeLabel } from "@/features/onboarding/api/company";
import type { CandidateInterview, PublicJob, PublicRequirement } from "../types/public";

/** GET /vacancies/{id}/public (ai_talent_back, Endpoints/Contracts.cs: PublicVacancyResponse). */
interface ApiPublicVacancy {
  id: string;
  title: string;
  area: string | null;
  closingAt: string | null;
  positions: number;
  companyName: string;
  companySector: string | null;
  companySize: string | null;
  description: string | null;
  listing: { location: string | null; modality: string | null; contractType: string | null; schedule: string | null; salary: string | null };
  publishedAt: string | null;
  requirements: { type: "MANDATORY" | "DESIRABLE" | "DISQUALIFYING"; category: string | null; description: string; condition: string | null; alsoCounts: string[] }[];
}

/** Instante ISO → "AAAA-MM-DD" en la hora de Bogotá, como lo muestra la ficha. */
const day = (iso: string | null) => (iso ? new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date(iso)) : "");

const toRequirement = (r: ApiPublicVacancy["requirements"][number]): PublicRequirement => ({
  text: r.condition ? `${r.description} (${r.condition})` : r.description,
  category: r.category ?? "Requisitos",
  alsoCounts: r.alsoCounts,
});

/** Vacante pública para postularse. Solo existe si está abierta; si no, null (la página muestra 404). */
export async function getPublicJob(id: string): Promise<PublicJob | null> {
  let v: ApiPublicVacancy;
  try {
    v = await apiFetch<ApiPublicVacancy>(`/vacancies/${id}/public`);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
  return {
    id: v.id,
    title: v.title,
    company: v.companyName,
    companySector: v.companySector,
    companySize: v.companySize ? companySizeLabel(v.companySize) : null,
    area: v.area ?? "",
    openings: v.positions,
    closesAt: day(v.closingAt),
    postedAt: day(v.publishedAt),
    location: v.listing.location,
    modality: modalityLabel(v.listing.modality),
    contract: v.listing.contractType,
    schedule: v.listing.schedule,
    salary: v.listing.salary,
    description: v.description ?? "",
    // Los descalificantes son criterio interno: no se publican.
    mandatory: v.requirements.filter((r) => r.type === "MANDATORY").map(toRequirement),
    desirable: v.requirements.filter((r) => r.type === "DESIRABLE").map(toRequirement),
  };
}

/** Entrevista IA que recibe el candidato por correo: GET /public/interviews/{token}. */
export async function getCandidateInterview(token: string): Promise<CandidateInterview | null> {
  try {
    return await apiFetch<CandidateInterview>(`/public/interviews/${encodeURIComponent(token)}`);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
