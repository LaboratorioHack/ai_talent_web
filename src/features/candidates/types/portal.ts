import type { ResumeDoc } from "@/shared/types/resume-doc";

/**
 * Portal del postulante. Lo que la persona ve de sus procesos: etapa, fechas
 * y lo que sigue. Nunca puntajes, posiciones ni lo que opinó la IA.
 */
export type PortalStage = "received" | "review" | "interview" | "decision";
export type PortalOutcome = "open" | "selected" | "closed" | "withdrawn";

export interface PortalApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  /** Vacío si la empresa no lo publicó. */
  location: string;
  /** "Presencial", "Híbrido", "Remoto" o vacío. */
  modality: string;
  appliedAt: string;
  updatedAt: string;
  stage: PortalStage;
  outcome: PortalOutcome;
  /** Qué pasa ahora, dicho para la persona. */
  note: string;
  /** Token de la entrevista por chat si está pendiente. */
  interviewToken?: string;
  interviewDue?: string;
  /** Fechas por etapa ya alcanzada. */
  history: { stage: PortalStage; at: string }[];
}

export interface Applicant {
  name: string;
  email: string;
  /** Área en la que más se postula; null si aún no se postula. */
  interest: string | null;
}

export interface ResumeSummary {
  fileName: string;
  sizeKb: number;
  updatedAt: string;
  /** La hoja de vida como documento, lista para verse y editarse. */
  doc: ResumeDoc;
  /** Lo que Criba AI encontró en ella (sin datos personales). */
  skills: string[];
  /** PROCESSED cuando Criba AI ya la leyó. */
  status: "PENDING" | "PROCESSING" | "PROCESSED" | "FAILED";
  /** Archivos que ha enviado, el más reciente primero. */
  versions: { fileName: string; at: string }[];
}

export interface PortalJob {
  id: string;
  title: string;
  company: string;
  area: string;
  location: string;
  modality: string;
  closesAt: string | null;
  postedAt: string | null;
  highlights: string[];
  applied: boolean;
  /** Qué tan afín es a la hoja de vida, según Criba AI. Nunca un puntaje. Sin hoja de vida no hay. */
  match?: { level: "alta" | "media" | "baja"; reasons: string[] };
}

/** "Medellín, híbrido" con lo que haya; vacío si la empresa no publicó ninguno. */
export const placeOf = (p: { location: string; modality: string }): string => [p.location, p.modality.toLowerCase()].filter(Boolean).join(", ");
