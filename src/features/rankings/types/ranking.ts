import type { Equivalence, Fulfillment, RequirementResult, RequirementType } from "@/shared/types/domain";
import type { ResumeDoc } from "@/shared/types/resume-doc";

export interface RankRequirement {
  id: string;
  description: string;
  type: RequirementType;
  weight: number | null;
  category?: string;
  equivalences: Equivalence[];
}

export interface RankedCandidate {
  /** Id de la postulación. */
  id: string;
  name: string;
  score: number;
  fulfillment: Fulfillment;
  mandatoryMet: number;
  mandatoryTotal: number;
  confidence: number;
  evaluatedAt: string;
  sourceLabel: string;
  results: RequirementResult[];
  toValidate: { label: string; tone: "warning" | "neutral" }[];
  resume: ResumeDoc;
}

export interface RankingData {
  job: { id: string; title: string; closesAt: string; profileVersion: number; received: number };
  jobs: { value: string; label: string; hint?: string }[];
  requirements: RankRequirement[];
  candidates: RankedCandidate[];
}

export interface RankingSummary {
  id: string;
  title: string;
  closesAt: string;
  evaluated: number;
  meets: number;
  partial: number;
  doesNotMeet: number;
  top: { id: string; name: string; score: number }[];
}

/** Una persona destacada en la portada de Ranking (todas las vacantes). */
export interface TopPerson {
  id: string;
  name: string;
  score: number;
  fulfillment: Fulfillment;
  confidence: number;
  jobId: string;
  jobTitle: string;
  /** Citas de la hoja de vida que más pesan. */
  highlights: { requirement: string; citation: string }[];
  met: string[];
  missing: string[];
}
