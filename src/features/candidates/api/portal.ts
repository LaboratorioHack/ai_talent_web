import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockRequirementsOf, mockUser, mockVacancies } from "@/shared/mocks";
import type { Applicant, PortalApplication, PortalJob, ResumeSummary } from "../types/portal";

/*
 * Datos del portal del postulante. Con backend, todo cuelga de la sesión del
 * candidato (Supabase Auth con enlace mágico; candidates.user_id):
 * GET /me/applicant, /me/applications, /me/applications/{id}, /me/resume y /public/vacancies.
 */

const COMPANY = mockUser.company.name;

const APPLICANT: Applicant = {
  name: "Sebastián Vega",
  email: "sebastian.vega@example.com",
  phone: "300 000 0000",
  city: "Medellín",
  interest: "Tecnología",
};

const PLACE: Record<string, { location: string; modality: PortalJob["modality"] }> = {
  "v-cloud": { location: "Medellín", modality: "Híbrido" },
  "v-data": { location: "Bogotá", modality: "Remoto" },
  "v-backend": { location: "Medellín", modality: "Remoto" },
  "v-ux": { location: "Cali", modality: "Híbrido" },
  "v-product": { location: "Bogotá", modality: "Remoto" },
  "v-sec": { location: "Bogotá", modality: "Presencial" },
};

/** Lo más visible de cada vacante en su tarjeta. */
const HIGHLIGHTS: Record<string, string[]> = {
  "v-data": ["SQL", "Power BI", "Estadística"],
  "v-backend": [".NET o Java", "APIs REST", "Git"],
  "v-ux": ["Investigación", "Figma", "Prototipos"],
  "v-product": ["Roadmap", "Métricas", "Equipos ágiles"],
  "v-sec": ["SIEM", "ISO 27001", "Respuesta a incidentes"],
};

const job = (id: string) => mockVacancies.find((v) => v.id === id)!;

const APPLICATIONS: PortalApplication[] = [
  {
    id: "p-cloud",
    jobId: "v-cloud",
    jobTitle: job("v-cloud").title,
    company: COMPANY,
    ...PLACE["v-cloud"],
    appliedAt: "2026-10-28",
    updatedAt: "2026-11-10",
    stage: "interview",
    outcome: "open",
    note: "Te invitaron a una entrevista corta por chat. Respóndela cuando te quede bien, antes de que venza el enlace.",
    interviewToken: "i-4",
    interviewDue: "2026-11-13",
    history: [
      { stage: "received", at: "2026-10-28" },
      { stage: "review", at: "2026-11-02" },
      { stage: "interview", at: "2026-11-10" },
    ],
  },
  {
    id: "p-backend",
    jobId: "v-backend",
    jobTitle: job("v-backend").title,
    company: COMPANY,
    ...PLACE["v-backend"],
    appliedAt: "2026-11-05",
    updatedAt: "2026-11-07",
    stage: "review",
    outcome: "open",
    note: "El equipo está revisando las postulaciones. Te escribimos apenas haya una decisión.",
    history: [
      { stage: "received", at: "2026-11-05" },
      { stage: "review", at: "2026-11-07" },
    ],
  },
  {
    id: "p-sec",
    jobId: "v-sec",
    jobTitle: job("v-sec").title,
    company: COMPANY,
    ...PLACE["v-sec"],
    appliedAt: "2026-11-10",
    updatedAt: "2026-11-10",
    stage: "received",
    outcome: "open",
    note: "Recibimos tu hoja de vida y ya la leímos. Pronto entra a revisión.",
    history: [{ stage: "received", at: "2026-11-10" }],
  },
  {
    id: "p-data",
    jobId: "v-data",
    jobTitle: job("v-data").title,
    company: COMPANY,
    ...PLACE["v-data"],
    appliedAt: "2026-10-25",
    updatedAt: "2026-11-04",
    stage: "decision",
    outcome: "closed",
    note: "Esta vez el proceso siguió con otras personas. Tu hoja de vida queda guardada por si se abre algo parecido.",
    history: [
      { stage: "received", at: "2026-10-25" },
      { stage: "review", at: "2026-10-29" },
      { stage: "decision", at: "2026-11-04" },
    ],
  },
];

const RESUME: ResumeSummary = {
  fileName: "sebastian_vega_cv.pdf",
  sizeKb: 196,
  updatedAt: "2026-10-28",
  removed: ["Nombre", "Foto", "Fecha de nacimiento", "Género", "Dirección y ciudad", "Nacionalidad", "Estado civil", "Correo y teléfono"],
  anonymized: [
    { section: "Experiencia", lines: ["Ingeniero de plataforma, sector financiero, 2021 a hoy", "Migración de 30 servicios a AKS con Azure DevOps", "Ingeniero DevOps, empresa de software, 2018 a 2021"] },
    { section: "Formación", lines: ["Ingeniería de Sistemas", "AWS Solutions Architect Associate", "AZ-305, en curso"] },
    { section: "Idiomas", lines: ["Inglés B2"] },
    { section: "Competencias", lines: ["Azure, AKS, Terraform, Kubernetes, GitHub Actions, Grafana"] },
  ],
};

export async function getApplicant(): Promise<Applicant> {
  if (!env.useMocks) return apiFetch<Applicant>("/me/applicant");
  return delay(APPLICANT, 200);
}

export async function listMyApplications(): Promise<PortalApplication[]> {
  if (!env.useMocks) return apiFetch<PortalApplication[]>("/me/applications");
  return delay(APPLICATIONS);
}

export async function getMyApplication(id: string): Promise<PortalApplication | null> {
  if (!env.useMocks) return apiFetch<PortalApplication>(`/me/applications/${id}`).catch(() => null);
  return delay(APPLICATIONS.find((a) => a.id === id) ?? null);
}

export async function getMyResume(): Promise<ResumeSummary> {
  if (!env.useMocks) return apiFetch<ResumeSummary>("/me/resume");
  return delay(RESUME);
}

/** Vacantes abiertas, con lo más visible de cada una y si ya te postulaste. */
export async function listOpenJobs(): Promise<PortalJob[]> {
  if (!env.useMocks) return apiFetch<PortalJob[]>("/public/vacancies");
  const mine = new Set(APPLICATIONS.filter((a) => a.outcome !== "withdrawn").map((a) => a.jobId));
  return delay(
    mockVacancies
      .filter((v) => v.status === "OPEN")
      .map((v) => ({
        id: v.id,
        title: v.title,
        company: COMPANY,
        area: v.profile.area,
        ...(PLACE[v.id] ?? { location: "Bogotá", modality: "Híbrido" as const }),
        closesAt: v.closesAt,
        highlights:
          HIGHLIGHTS[v.id] ??
          mockRequirementsOf(v)
            .filter((r) => r.type === "MANDATORY")
            .slice(0, 3)
            .map((r) => r.description),
        applied: mine.has(v.id),
      })),
  );
}
