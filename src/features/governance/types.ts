import type { AuditDecision } from "@/shared/types/domain";

export type GovernancePeriod = "7d" | "30d" | "90d";

export const PERIOD_DAYS: Record<GovernancePeriod, number> = { "7d": 7, "30d": 30, "90d": 90 };

export interface BiasAlert {
  id: string;
  vacancy: string;
  text: string;
  detail: string;
}

/** GET /governance/audit (ai_talent_back, GovernanceContracts.cs). */
export interface GovernanceData {
  organization: string;
  stats: {
    sensitiveUsed: number;
    resumesEvaluated: number;
    scoresWithEvidence: number;
    humanDecisions: number;
    aiErrorsFlagged: number;
  };
  attributes: { label: string; used: boolean; note: string }[];
  decisions: AuditDecision[];
  alerts: BiasAlert[];
}
