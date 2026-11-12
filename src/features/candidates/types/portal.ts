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
  location: string;
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
  phone: string;
  city: string;
  /** Área en la que más se postula: guía las recomendaciones. */
  interest: string;
}

export interface ResumeSummary {
  fileName: string;
  sizeKb: number;
  updatedAt: string;
  /** La hoja de vida como documento, lista para verse y editarse. */
  doc: ResumeDoc;
}

export interface PortalJob {
  id: string;
  title: string;
  company: string;
  area: string;
  location: string;
  modality: "Presencial" | "Híbrido" | "Remoto";
  closesAt: string;
  highlights: string[];
  applied: boolean;
}
