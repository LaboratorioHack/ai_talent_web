import { env } from "@/config/env";
import type { NavCounts } from "@/shared/components/layout";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockInterviews, mockUser, mockVacancies } from "@/shared/mocks";
import type { CurrentUser } from "@/shared/types/domain";

/** Usuario autenticado con su organización activa y sus membresías. */
export async function getCurrentUser(): Promise<CurrentUser> {
  if (env.useMocks) return delay(mockUser, 50);
  return apiFetch<CurrentUser>("/me");
}

/** Contadores de la barra de navegación. */
export async function getNavCounts(): Promise<NavCounts> {
  if (env.useMocks) {
    const open = mockVacancies.filter((v) => v.status === "OPEN");
    return delay(
      {
        vacancies: open.length,
        candidates: open.reduce((sum, v) => sum + v.stats.received, 0) - 55,
        interviews: mockInterviews.length + 8,
      },
      50,
    );
  }
  return apiFetch<NavCounts>("/me/nav-counts");
}
