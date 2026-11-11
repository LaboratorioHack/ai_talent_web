import "server-only";

import { redirect } from "next/navigation";
import { env } from "@/config/env";
import type { NavNotice, SearchItem } from "@/shared/components/layout";
import { routes } from "@/shared/constants/routes";
import { apiFetch } from "@/shared/lib/api-client";
import { createSupabaseServerClient, supabaseConfigured } from "@/shared/lib/supabase/server";
import { delay, mockApplications, mockUser, mockVacancies } from "@/shared/mocks";
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

/** Avisos de la campana: lo que necesita una acción de la persona. */
export async function getNavNotices(): Promise<NavNotice[]> {
  if (!env.useMocks) return apiFetch<NavNotice[]>("/me/notices");
  return delay(
    [
      { id: "n1", text: "3 hojas de vida ilegibles en Analista de Datos", when: "Hace 20 min", href: "/candidates?job=v-data", tone: "warning" },
      { id: "n2", text: "El token de LinkedIn venció; vuelve a autorizar", when: "Hace 3 h", href: "/integrations", tone: "danger" },
      { id: "n3", text: "Daniela Osorio terminó la entrevista con 1 contraste", when: "Ayer 17:54", href: "/interviews/i-1", tone: "warning" },
      { id: "n4", text: "Ingeniero Cloud Senior: 84 hojas de vida evaluadas", when: "Ayer 09:42", href: "/rankings/v-cloud", tone: "success" },
    ],
    50,
  );
}

/** Índice del buscador rápido: vacantes y candidatos de la organización. */
export async function getSearchIndex(): Promise<SearchItem[]> {
  if (!env.useMocks) return apiFetch<SearchItem[]>("/me/search-index");
  const vacancies: SearchItem[] = mockVacancies.map((v) => ({ id: `v-${v.id}`, label: v.title, hint: `${v.stats.received} hojas de vida`, href: routes.vacancy(v.id), group: "Vacantes" }));
  const candidates: SearchItem[] = mockApplications.map((a) => ({
    id: `c-${a.id}`,
    label: a.candidate.name,
    hint: a.evaluation ? `Ingeniero Cloud Senior, ${a.evaluation.totalScore} de 100` : "Ingeniero Cloud Senior, sin evaluar",
    href: routes.ranking(a.jobOpeningId, a.id),
    group: "Candidatos",
  }));
  return delay([...vacancies, ...candidates], 50);
}
