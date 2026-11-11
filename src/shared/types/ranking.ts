import type { Equivalence, Fulfillment, RequirementResult, RequirementType } from "@/shared/types/domain";
import type { ResumeDoc } from "@/shared/types/resume-doc";

/** Requisito y candidato evaluado tal como los muestran ranking y tablero. */
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
