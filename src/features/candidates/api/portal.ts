import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import { delay, mockRequirementsOf, mockUser, mockVacancies } from "@/shared/mocks";
import type { Applicant, PortalApplication, PortalJob, ResumeSummary } from "../types/portal";
import { OTHER_COMPANY_JOBS } from "./other-companies";

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
  skills: ["7 años de experiencia", "Azure", "Kubernetes", "Terraform", "Azure DevOps", "AWS", "GitHub Actions", "Grafana", "Inglés B2"],
  doc: {
    name: "Sebastián Vega",
    headline: "Ingeniero de plataforma cloud",
    contact: ["sebastian.vega@example.com", "300 000 0000", "Medellín, Colombia"],
    sections: [
      {
        title: "Perfil",
        lines: [{ kind: "text", text: "Ingeniero de plataforma con 7 años entre DevOps y nube. Me gusta automatizar lo repetitivo y dejar todo documentado." }],
      },
      {
        title: "Experiencia",
        lines: [
          { kind: "role", text: "Ingeniero de plataforma — Sector financiero", right: "2021 – hoy" },
          { kind: "bullet", text: "Migré 30 servicios a AKS en diez meses, con pipelines en Azure DevOps." },
          { kind: "bullet", text: "Infraestructura como código con Terraform en tres ambientes." },
          { kind: "role", text: "Ingeniero DevOps — Empresa de software", right: "2018 – 2021" },
          { kind: "bullet", text: "Monitoreo con Prometheus y Grafana, y despliegues con GitHub Actions." },
        ],
      },
      {
        title: "Educación",
        lines: [{ kind: "role", text: "Ingeniería de Sistemas", right: "2018" }],
      },
      {
        title: "Certificaciones",
        lines: [
          { kind: "text", text: "AWS Solutions Architect – Associate (2023)" },
          { kind: "text", text: "AZ-305, en curso" },
        ],
      },
      {
        title: "Idiomas",
        lines: [{ kind: "text", text: "Inglés B2, español nativo" }],
      },
    ],
  },
};

export async function getApplicant(): Promise<Applicant> {
  if (!env.useMocks) return serverApi<Applicant>("/me/applicant");
  return delay(APPLICANT, 200);
}

export async function listMyApplications(): Promise<PortalApplication[]> {
  if (!env.useMocks) return serverApi<PortalApplication[]>("/me/applications");
  return delay(APPLICATIONS);
}

export async function getMyApplication(id: string): Promise<PortalApplication | null> {
  if (!env.useMocks) return serverApi<PortalApplication>(`/me/applications/${id}`).catch(() => null);
  return delay(APPLICATIONS.find((a) => a.id === id) ?? null);
}

export async function getMyResume(): Promise<ResumeSummary> {
  if (!env.useMocks) return serverApi<ResumeSummary>("/me/resume");
  return delay(RESUME);
}

/** Habilidad de la hoja de vida → palabra que la delata en una vacante. */
const SKILL_KEYS: Record<string, string> = {
  Azure: "azure",
  Kubernetes: "kubernetes",
  Terraform: "terraform",
  AWS: "aws",
  "Azure DevOps": "devops",
  "GitHub Actions": "git",
  Grafana: "grafana",
  "Inglés B2": "inglés",
};

/**
 * Criba AI compara las vacantes con lo que encontró en la hoja de vida y
 * explica por qué te sirve cada una. En el backend esto sale de los embeddings
 * de requisitos y fragmentos; aquí, de palabras clave.
 */
function matchOf(text: string): PortalJob["match"] {
  const t = text.toLowerCase();
  const reasons = Object.entries(SKILL_KEYS)
    .filter(([, key]) => t.includes(key))
    .map(([skill]) => skill);
  return { level: reasons.length >= 3 ? "alta" : reasons.length ? "media" : "baja", reasons };
}

/** Vacantes abiertas, con lo más visible de cada una, si ya te postulaste y qué tan afín es a tu hoja de vida. */
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
        match: matchOf(HIGHLIGHTS[v.id]?.join(" ") ?? mockRequirementsOf(v).map((r) => `${r.description} ${r.equivalences.map((e) => e.label).join(" ")}`).join(" ")),
      }))
      .concat(
        OTHER_COMPANY_JOBS.map((j) => ({
          id: j.id,
          title: j.title,
          company: j.company,
          area: j.area,
          location: j.location,
          modality: j.modality,
          closesAt: j.closesAt,
          highlights: j.mandatory.map((r) => r.text),
          applied: false,
          match: matchOf([...j.mandatory, ...j.desirable].map((r) => `${r.text} ${r.alsoCounts.join(" ")}`).join(" ")),
        })),
      )
      .sort((a, b) => "altamediabaja".indexOf(a.match.level) - "altamediabaja".indexOf(b.match.level)),
  );
}
