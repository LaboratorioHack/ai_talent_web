/** Respuestas de POST /vacancies/.../evaluate|rank|compare|evidence (feat/frontend-endpoints). */

export interface ApiEvidenceChunk {
  fragmentId: string;
  section?: string | null;
  citation: string;
  pageNumber?: number | null;
  similarity?: number | null;
}

export interface ApiRequirementAssessment {
  requirementId: string;
  result: string;
  score: number;
  confidence: number;
  justification: string;
  evidence: ApiEvidenceChunk[];
}

export interface ApiCandidateEvaluation {
  evaluationId: string;
  totalScore: number;
  fulfillment: string;
  confidence: number;
  recommendInterview: boolean;
  disqualified: boolean;
  strengths: unknown[];
  gaps: unknown[];
  requirementAssessments: ApiRequirementAssessment[];
  aiModel: string;
  promptVersion: string;
  reasoningSummary: string;
}

export interface ApplicationEvaluationResponse {
  vacancyId: string;
  applicationId: string;
  resumeId: string;
  roleProfileId: string;
  evaluation: ApiCandidateEvaluation;
}

export interface RankedApplicationResponse {
  position: number;
  applicationId: string;
  candidateId: string;
  candidateName: string;
  resumeId: string;
  evaluationId: string;
  totalScore: number;
  confidence: number;
  fulfillment: string;
  recommendInterview: boolean;
}

export interface VacancyRankingResponse {
  vacancyId: string;
  roleProfileId: string;
  profileVersion: number;
  ranked: RankedApplicationResponse[];
  notRanked: string[];
}

export interface ComparedApplicationRef {
  applicationId: string;
  resumeId: string;
  candidateName: string;
}

export interface ApiSideBySideCandidate {
  candidateId: string;
  primaryAdvantage: string;
  primaryTradeOffOrGap: string;
  idealTeamFit: string;
}

export interface ApplicationComparisonResponse {
  vacancyId: string;
  candidates: ComparedApplicationRef[];
  comparison: {
    roleProfileId: string;
    comparativeSummary: string;
    sideBySideMatrix: ApiSideBySideCandidate[];
    headToHeadTradeOff: string;
    recommendedInterviewFocus: { candidateId: string; targetGapToVerify: string; suggestedInterviewQuestion: string }[];
  };
}

export interface ApplicationEvidenceResponse {
  applicationId: string;
  search: {
    resumeId: string;
    query: string;
    chunks: ApiEvidenceChunk[];
  };
}
