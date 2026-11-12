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
  tradeoffs: (jobId: string) => `/rankings/${jobId}/matriz`,
  interviews: "/interviews",
  interview: (id: string) => `/interviews/${id}`,
  governance: "/governance",
  /** Públicas, para el candidato: vacante con postulación, confirmación y entrevista IA. */
  apply: (jobId: string) => `/jobs/${jobId}`,
  applied: (jobId: string) => `/jobs/${jobId}/applied`,
  candidateInterview: (token: string) => `/interview/${token}`,
  /** Portal del postulante (sesión de candidato, enlace mágico). */
  portal: "/portal",
  portalSignIn: "/portal/sign-in",
  portalJobs: "/portal/jobs",
  portalApplication: (id: string) => `/portal/applications/${id}`,
  portalResume: "/portal/resume",
  design: "/design",
} as const;
