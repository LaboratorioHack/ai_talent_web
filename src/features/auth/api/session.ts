import "server-only";

import { redirect } from "next/navigation";
import { env } from "@/config/env";
import type { NavCounts } from "@/shared/components/layout";
import { routes } from "@/shared/constants/routes";
import { apiFetch } from "@/shared/lib/api-client";
import { createSupabaseServerClient, supabaseConfigured } from "@/shared/lib/supabase/server";
import { delay, mockInterviews, mockUser, mockVacancies } from "@/shared/mocks";
import type { CurrentUser } from "@/shared/types/domain";

/**
 * Usuario autenticado con su organización activa y sus membresías.
 * Con Supabase configurado exige sesión; el perfil lo sirve la API .NET
 * (o el mock mientras no exista el endpoint).
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  if (!supabaseConfigured) return delay(mockUser, 50);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  if (env.useMocks) {
    return { ...mockUser, id: user.id, email: user.email ?? mockUser.email, name: (user.user_metadata?.name as string | undefined) ?? mockUser.name };
  }
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
