import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockInterviews, mockRequirementsOf, mockUser, mockVacancies } from "@/shared/mocks";
import type { CandidateInterview, PublicJob } from "../types/public";
import { OTHER_COMPANY_JOBS } from "./other-companies";

const DESCRIPTIONS: Record<string, string> = {
  "v-cloud":
    "Buscamos una persona que lidere la plataforma cloud: migración de servicios a Azure, operación de Kubernetes en producción e infraestructura como código. Trabajará con equipos de desarrollo y seguridad, y con un equipo distribuido en inglés.",
  "v-data": "Buscamos a alguien que convierta datos de operación en decisiones: modelos en SQL, tableros para las áreas de negocio y acompañamiento a quienes los usan.",
  "v-backend": "Te sumarás a un equipo que construye servicios internos. Escribirás APIs, pruebas y documentación, con acompañamiento de personas senior.",
  "v-ux": "Diseñarás flujos de producto de punta a punta: investigación con usuarios, prototipos y trabajo diario con desarrollo.",
  "v-product": "Liderarás un producto digital: prioridades, roadmap y conversación permanente con clientes y con el equipo de desarrollo.",
  "v-sec": "Cuidarás la seguridad de la plataforma: gestión de vulnerabilidades, respuesta a incidentes y controles en la nube.",
};

/** Datos de publicación que la vacante aún no guarda en el editor (ver handoff). */
const LISTING: Record<string, Pick<PublicJob, "location" | "modality" | "contract" | "schedule" | "salary" | "postedAt">> = {
  "v-cloud": { location: "Medellín", modality: "Híbrido", contract: "Término indefinido", schedule: "Tiempo completo", salary: null, postedAt: "2026-10-20" },
  "v-data": { location: "Bogotá", modality: "Remoto", contract: "Término indefinido", schedule: "Tiempo completo", salary: null, postedAt: "2026-10-24" },
  "v-backend": { location: "Medellín", modality: "Remoto", contract: "Término fijo, 1 año", schedule: "Tiempo completo", salary: null, postedAt: "2026-10-27" },
  "v-ux": { location: "Cali", modality: "Híbrido", contract: "Término indefinido", schedule: "Tiempo completo", salary: null, postedAt: "2026-10-30" },
  "v-product": { location: "Bogotá", modality: "Remoto", contract: "Término indefinido", schedule: "Tiempo completo", salary: null, postedAt: "2026-11-04" },
  "v-sec": { location: "Bogotá", modality: "Presencial", contract: "Término indefinido", schedule: "Tiempo completo", salary: null, postedAt: "2026-11-06" },
};
const FALLBACK = LISTING["v-cloud"];

/**
 * Vacante pública para postularse. Solo existe si está abierta.
 * Con backend: GET /public/vacancies/{id} (sin sesión).
 */
export async function getPublicJob(id: string): Promise<PublicJob | null> {
  if (!env.useMocks) return apiFetch<PublicJob>(`/public/vacancies/${id}`).catch(() => null);
  const other = OTHER_COMPANY_JOBS.find((j) => j.id === id);
  if (other) return delay(other);
  const job = mockVacancies.find((v) => v.id === id && v.status === "OPEN");
  if (!job) return delay(null);
  const reqs = mockRequirementsOf(job);
  const toPublic = (r: (typeof reqs)[number]) => ({
    text: r.description,
    category: r.category ?? "Otros",
    alsoCounts: r.equivalences.map((e) => e.label).filter((l) => !/equivalente/i.test(l)),
  });
  return delay({
    ...(LISTING[job.id] ?? FALLBACK),
    id: job.id,
    title: job.title,
    company: mockUser.company.name,
    companySector: "Banca y finanzas",
    companySize: "1.001 a 5.000 personas",
    area: job.profile.area,
    openings: job.openings,
    closesAt: job.closesAt,
    description: job.profile.description || DESCRIPTIONS[job.id] || "",
    mandatory: reqs.filter((r) => r.type === "MANDATORY").map(toPublic),
    desirable: reqs.filter((r) => r.type === "NICE_TO_HAVE").map(toPublic),
  });
}

/**
 * Entrevista IA que recibe el candidato por correo. El token es el del enlace.
 * Con backend: GET /public/interviews/{token}.
 */
export async function getCandidateInterview(token: string): Promise<CandidateInterview | null> {
  if (!env.useMocks) return apiFetch<CandidateInterview>(`/public/interviews/${token}`).catch(() => null);
  const iv = mockInterviews.find((i) => i.id === token);
  if (!iv) return delay(null);
  // La entrevista en vivo del mock aún no tiene todas sus preguntas: se usan las de una completa de la misma vacante.
  const complete = (i: typeof iv) => i.turns.every((t) => t.question);
  const source = complete(iv) ? iv : (mockInterviews.find((i) => i.jobTitle === iv.jobTitle && complete(i)) ?? iv);
  return delay({
    token,
    candidateName: iv.candidate.name,
    jobTitle: iv.jobTitle,
    company: mockUser.company.name,
    expiresAt: iv.status === "SCHEDULED" ? iv.startedAt : "2026-11-13T23:59:00",
    state: iv.status === "DONE" ? "done" : "open",
    questions: source.turns.map((t) => t.question).filter(Boolean),
  });
}
