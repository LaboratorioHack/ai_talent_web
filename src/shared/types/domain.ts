/**
 * Tipos de dominio compartidos. Siguen el esquema de Supabase
 * (ai_talent_back/supabase/migrations) con nombres en camelCase.
 */

export type Id = string;

export type UserRole = "ADMIN" | "RECRUITER";
export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";
export type RequirementType = "MANDATORY" | "NICE_TO_HAVE" | "DISQUALIFYING";
export type Fulfillment = "MEETS" | "PARTIAL" | "DOES_NOT_MEET";
export type RequirementResultKind = Fulfillment | "NO_EVIDENCE";
export type ResumeProcessingStatus = "PENDING" | "PROCESSING" | "READ" | "UNREADABLE" | "DUPLICATE" | "UNSUPPORTED" | "NO_DATA";
export type EvaluationProcessingStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";
export type SelectionStatus = "APPLIED" | "EVALUATED" | "MEETS" | "INTERVIEW" | "FINALIST" | "DISCARDED";
export type InterviewRecommendation = "ADVANCE" | "DO_NOT_ADVANCE" | "REVIEW";
export type PipelineStage = "received" | "evaluated" | "meets" | "interview" | "finalist";

export interface Company {
  id: Id;
  name: string;
}

export interface CurrentUser {
  id: Id;
  name: string;
  email: string;
  company: Company;
  role: UserRole;
}

export interface Equivalence {
  label: string;
  /** 0–100: cuánto cuenta respecto al requisito original. */
  percent: number;
}

export interface Requirement {
  id: Id;
  roleProfileId: Id;
  type: RequirementType;
  category?: string;
  description: string;
  /** Peso 0–100. Los descalificantes no pesan. */
  weight: number | null;
  equivalences: Equivalence[];
}

export interface RoleProfile {
  id: Id;
  jobOpeningId: Id;
  version: number;
  description: string;
  area: string;
  requirements: Requirement[];
  autoInterview: boolean;
}

export interface JobOpening {
  id: Id;
  companyId: Id;
  title: string;
  status: JobStatus;
  openings: number;
  closesAt: string; // ISO date
  createdAt: string;
  profile: RoleProfile;
  stats: {
    received: number;
    read: number;
    meets: number;
    partial: number;
    doesNotMeet: number;
    interview: number;
    /** Solo cuando la API expone el dato (p. ej. mocks o dashboard agregado). */
    finalist?: number;
  };
}

export interface Candidate {
  id: Id;
  name: string;
  contactEmail: string;
}

export interface Resume {
  id: Id;
  candidateId: Id;
  fileName: string;
  fileType: "PDF" | "DOCX" | "JPG" | "PNG";
  pages: number;
  sizeKb: number;
  status: ResumeProcessingStatus;
  /** Resumen de lo leído: "nombre, 3 empleos y 4 certificaciones leídos". */
  summary?: string;
}

export interface Evidence {
  id: Id;
  citation: string;
  /** "CV pág. 1 · 2022–2025" */
  location: string;
}

export interface RequirementResult {
  id: Id;
  requirementId: Id;
  result: RequirementResultKind;
  /** Puntos aportados al total. */
  score: number;
  confidence: number;
  justification: string;
  evidence: Evidence[];
}

export interface Evaluation {
  id: Id;
  applicationId: Id;
  candidateId: Id;
  jobOpeningId: Id;
  status: EvaluationProcessingStatus;
  totalScore: number;
  fulfillment: Fulfillment;
  disqualified: boolean;
  confidence: number;
  strengths: string[];
  gaps: string[];
  recommendInterview: boolean;
  /** Puntos a validar en entrevista: "Cert. Azure · parcial". */
  toValidate: { label: string; tone: "warning" | "neutral" }[];
  results: RequirementResult[];
  evaluatedAt: string;
  profileVersion: number;
}

export interface Application {
  id: Id;
  jobOpeningId: Id;
  candidate: Candidate;
  source: "CANDIDATE" | "COMPANY_UPLOAD";
  stage: PipelineStage;
  selectionStatus: SelectionStatus;
  evaluation?: Evaluation;
  resume: Resume;
}

export interface InterviewTurn {
  order: number;
  topic: string;
  question: string;
  answer?: string;
  /** "match" coincide con el CV, "conflict" lo contradice. */
  verdict?: "match" | "conflict";
}

export interface InterviewContrast {
  label: string;
  cvSays: string;
  interviewSays: string;
  verdict: "match" | "conflict" | "missing";
}

export interface Interview {
  id: Id;
  evaluationId: Id;
  candidate: Candidate;
  jobTitle: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "DONE";
  durationMin: number;
  startedAt: string;
  totalQuestions: number;
  turns: InterviewTurn[];
  contrasts: InterviewContrast[];
  recommendation?: InterviewRecommendation;
}

export interface AuditDecision {
  when: string;
  action: string;
  who: string;
  subject: string;
  status: "meets" | "partial" | "does_not_meet" | "unevaluated";
}

export interface PendingItem {
  id: Id;
  kind: "unreadable" | "duplicate" | "contrast";
  text: string;
  actionLabel: string;
  href: string;
}
