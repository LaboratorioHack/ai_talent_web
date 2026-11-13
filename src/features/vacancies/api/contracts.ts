import { REQUIREMENT_TYPE_TO_API } from "@/shared/lib/vacancy-api";
import type { RequirementDraft, RoleProfileDraft } from "../schemas/role-profile";

/** Cuerpos que el editor manda a /api/vacancies (ai_talent_back, Endpoints/Contracts.cs). */

/** Fin del día elegido en la hora local: la vacante cierra ese día, no la noche anterior. */
function toClosingAt(date: string): string | null {
  return date ? new Date(`${date}T23:59:59`).toISOString() : null;
}

const toRequirementRequest = (r: RequirementDraft) => ({
  type: REQUIREMENT_TYPE_TO_API[r.type],
  description: r.description.trim(),
  // La API exige peso en todos; los descalificantes no suman a los 100.
  weight: r.type === "DISQUALIFYING" ? 0 : (r.weight ?? 0),
  equivalences: Object.fromEntries(r.equivalences.map((e) => [e.label.trim(), e.percent])),
});

/** Cuerpo de PATCH /vacancies/{id}; POST /vacancies lo usa junto al perfil. Vacío = no lo publicó. */
export const toVacancyFields = (d: RoleProfileDraft) => ({
  title: d.title.trim(),
  area: d.area || null,
  closingAt: toClosingAt(d.closesAt),
  positions: d.openings,
  location: d.listing.location.trim(),
  modality: d.listing.modality,
  contractType: d.listing.contract,
  schedule: d.listing.schedule,
  salary: d.listing.salary.trim(),
});

/** Cuerpo de PUT /vacancies/{id}/profile. */
export const toProfileRequest = (d: RoleProfileDraft) => ({
  description: d.description,
  requirements: d.requirements.map(toRequirementRequest),
});
