/** Rutas de la app. Las features enlazan desde aquí para no repetir strings. */
export const routes = {
  home: "/home",
  login: "/login",
  onboarding: (step: 2 | 3) => `/onboarding/${step}` as const,
  onboardingDone: "/onboarding/listo",
  vacancies: "/vacancies",
  vacancy: (id: string) => `/vacancies/${id}`,
  vacancyEdit: (id: string) => `/vacancies/${id}/profile`,
  newVacancy: "/vacancies/new",
  candidates: "/candidates",
  rankings: "/rankings",
  ranking: (jobId: string, applicationId?: string) =>
    applicationId ? `/rankings/${jobId}?candidate=${applicationId}` : `/rankings/${jobId}`,
  interviews: "/interviews",
  interview: (id: string) => `/interviews/${id}`,
  governance: "/governance",
  /** Públicas, para el candidato: vacante con postulación, confirmación y entrevista IA. */
  apply: (jobId: string) => `/jobs/${jobId}`,
  applied: (jobId: string) => `/jobs/${jobId}/applied`,
  candidateInterview: (token: string) => `/interview/${token}`,
  design: "/design",
} as const;
