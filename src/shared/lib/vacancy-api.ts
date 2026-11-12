import type { Equivalence, JobOpening, JobStatus, PipelineStage, Requirement, RequirementType } from "@/shared/types/domain";

/**
 * Respuestas de /api/vacancies (ai_talent_back, Endpoints/Contracts.cs) y su
 * conversión al dominio del front. En `shared` porque las leen vacantes,
 * ingesta y el buscador de la barra.
 */

export type ApiRequirementType = "MANDATORY" | "DESIRABLE" | "DISQUALIFYING";

export interface ApiRequirement {
  id: string;
  type: ApiRequirementType;
  category: string | null;
  description: string;
  condition: string | null;
  weight: number;
  /** null cuando no hay equivalencias. */
  equivalences: Record<string, number> | null;
}

export interface ApiVacancyCounts {
  resumes: number;
  meets: number;
  partiallyMeets: number;
  doesNotMeet: number;
  disqualified: number;
  interviews: number;
}

export interface ApiVacancySummary {
  id: string;
  title: string;
  area: string | null;
  status: JobStatus;
  closingAt: string | null;
  positions: number;
  profileVersion: number | null;
  counts: ApiVacancyCounts;
  createdAt: string;
  updatedAt: string;
}

export interface ApiVacancyDetail extends ApiVacancySummary {
  profileId: string | null;
  description: string | null;
  weightTotal: number;
  profileInUse: boolean;
  requirements: ApiRequirement[];
}

export interface ApiVacancyPage {
  items: ApiVacancySummary[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiVacancyApplication {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  source: "CANDIDATE" | "COMPANYUPLOAD";
  selectionStatus: "APPLIED" | "SHORTLISTED" | "INTERVIEW" | "REJECTED" | "HIRED" | "WITHDRAWN";
  appliedAt: string;
  updatedAt: string;
  resumeId: string | null;
  resumeVersion: number | null;
  processingStatus: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED" | null;
  processingError: string | null;
  resumeCreatedAt: string | null;
}

/** La API devuelve como máximo 100 por página. */
export const VACANCY_PAGE_SIZE = 100;

export const vacanciesPath = `/vacancies?pageSize=${VACANCY_PAGE_SIZE}`;

const TYPE_FROM_API: Record<ApiRequirementType, RequirementType> = { MANDATORY: "MANDATORY", DESIRABLE: "NICE_TO_HAVE", DISQUALIFYING: "DISQUALIFYING" };

export const REQUIREMENT_TYPE_TO_API: Record<RequirementType, ApiRequirementType> = { MANDATORY: "MANDATORY", NICE_TO_HAVE: "DESIRABLE", DISQUALIFYING: "DISQUALIFYING" };

const toEquivalences = (map: Record<string, number> | null): Equivalence[] => Object.entries(map ?? {}).map(([label, percent]) => ({ label, percent }));

/** Instante ISO → "AAAA-MM-DD" en la hora local, el formato de fechas del front. */
function toLocalDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toRequirement(r: ApiRequirement, roleProfileId: string): Requirement {
  const type = TYPE_FROM_API[r.type];
  return {
    id: r.id,
    roleProfileId,
    type,
    category: r.category ?? undefined,
    description: r.description,
    weight: type === "DISQUALIFYING" ? null : r.weight,
    equivalences: toEquivalences(r.equivalences),
  };
}

export function toJobOpening(v: ApiVacancySummary | ApiVacancyDetail, companyId = ""): JobOpening {
  const detail = "requirements" in v ? v : null;
  const profileId = detail?.profileId ?? "";
  return {
    id: v.id,
    companyId,
    title: v.title,
    status: v.status,
    openings: v.positions,
    closesAt: toLocalDate(v.closingAt),
    createdAt: toLocalDate(v.createdAt),
    profile: {
      id: profileId,
      jobOpeningId: v.id,
      version: v.profileVersion ?? 0,
      description: detail?.description ?? "",
      area: v.area ?? "",
      requirements: detail?.requirements.map((r) => toRequirement(r, profileId)) ?? [],
      // La API aún no guarda esta opción; el editor la muestra encendida.
      autoInterview: true,
    },
    stats: {
      received: v.counts.resumes,
      // Sin conteo de «leídas» en /vacancies: usamos evaluaciones completadas, no recibidas.
      read: v.counts.meets + v.counts.partiallyMeets + v.counts.doesNotMeet,
      meets: v.counts.meets,
      partial: v.counts.partiallyMeets,
      doesNotMeet: v.counts.doesNotMeet + v.counts.disqualified,
      interview: v.counts.interviews,
    },
  };
}

/** Etapa del tablero; descartados y retirados no tienen columna. */
export function toPipelineStage(status: ApiVacancyApplication["selectionStatus"]): PipelineStage | null {
  switch (status) {
    case "APPLIED":
      return "received";
    case "SHORTLISTED":
      return "meets";
    case "INTERVIEW":
      return "interview";
    case "HIRED":
      return "finalist";
    default:
      return null;
  }
}
