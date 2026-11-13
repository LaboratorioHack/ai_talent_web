import "server-only";

import { redirect } from "next/navigation";
import type { NavNotice, SearchItem } from "@/shared/components/layout";
import { routes } from "@/shared/constants/routes";
import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { vacanciesPath, type ApiVacancyPage } from "@/shared/lib/vacancy-api";
import type { CurrentUser, UserRole } from "@/shared/types/domain";

/** GET /api/auth/me (ai_talent_back). `company` y `name` son null hasta crear o unirse a una empresa. */
export interface MeResponse {
  userId: string;
  email: string | null;
  name: string | null;
  mfaVerified: boolean;
  company: { id: string; name: string; sector: string | null; size: string | null; role: UserRole } | null;
}

export function getMe(): Promise<MeResponse> {
  return serverApi<MeResponse>("/auth/me");
}

/**
 * Usuario autenticado con su organización. Exige sesión de Supabase; el perfil
 * lo sirve la API .NET. Sin empresa todavía, va al onboarding.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const me = await getMe();
  if (!me.company) redirect(routes.onboarding(2));
  const email = me.email ?? user.email ?? "";
  return {
    id: me.userId,
    name: me.name ?? (user.user_metadata?.name as string | undefined) ?? email,
    email,
    company: { id: me.company.id, name: me.company.name },
    role: me.company.role,
  };
}

interface ApiNavNotice extends NavNotice {
  occurredAt?: string;
}

/**
 * Avisos de la campana: GET /notifications (hasta 10, en español).
 * Si la API falla, la campana queda vacía en vez de tumbar la barra.
 */
export async function getNavNotices(): Promise<NavNotice[]> {
  const rows = await serverApi<ApiNavNotice[]>("/notifications").catch((error: unknown) => {
    if (error instanceof ApiError) return [];
    throw error;
  });
  return rows.map((row): NavNotice => ({ id: row.id, text: row.text, when: row.when, href: row.href, tone: row.tone }));
}

/** Índice del buscador rápido: las vacantes de la organización. */
export async function getSearchIndex(): Promise<SearchItem[]> {
  try {
    const page = await serverApi<ApiVacancyPage>(vacanciesPath);
    return page.items.map((v): SearchItem => ({ id: `v-${v.id}`, label: v.title, hint: `${v.counts.resumes} hojas de vida`, href: routes.vacancy(v.id), group: "Vacantes" }));
  } catch (error) {
    // Sin empresa la API responde 403; getCurrentUser se encarga de mandar al onboarding.
    if (error instanceof ApiError && error.status === 403) return [];
    throw error;
  }
}
