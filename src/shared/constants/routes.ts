/** Rutas de la app. Las features enlazan desde aquí para no repetir strings. */
export const routes = {
  home: "/home",
  login: "/login",
  onboarding: (step: 2 | 3 | 4) => `/onboarding/${step}` as const,
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
  integrations: "/integrations",
  governance: "/governance",
  design: "/design",
} as const;
