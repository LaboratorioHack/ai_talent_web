import type { Fulfillment } from "@/shared/types/domain";
import type { RankedCandidate, RankRequirement } from "@/shared/types/ranking";

export type { RankedCandidate, RankRequirement };

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
