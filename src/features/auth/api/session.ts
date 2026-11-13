import "server-only";

import { redirect } from "next/navigation";
import { env } from "@/config/env";
import type { NavNotice, SearchItem } from "@/shared/components/layout";
import { routes } from "@/shared/constants/routes";
import { ApiError } from "@/shared/lib/api-client";
import { serverApi } from "@/shared/lib/api-server";
import { createSupabaseServerClient, supabaseConfigured } from "@/shared/lib/supabase/server";
import { vacanciesPath, type ApiVacancyPage } from "@/shared/lib/vacancy-api";
import { delay, mockApplications, mockUser, mockVacancies } from "@/shared/mocks";
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
 * Usuario autenticado con su organización. Con Supabase configurado exige
 * sesión; el perfil lo sirve la API .NET. Sin empresa todavía, va al onboarding.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  if (!supabaseConfigured) return delay(mockUser, 50);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(routes.login);

  const metadataName = user.user_metadata?.name as string | undefined;
  if (env.useMocks) {
    return { ...mockUser, id: user.id, email: user.email ?? mockUser.email, name: metadataName ?? mockUser.name };
  }

  const me = await getMe();
  if (!me.company) redirect(routes.onboarding(2));
  const email = me.email ?? user.email ?? "";
  return {
    id: me.userId,
    name: me.name ?? metadataName ?? email,
    email,
    company: { id: me.company.id, name: me.company.name },
    role: me.company.role,
  };
}

interface ApiNavNotice extends NavNotice {
  occurredAt?: string;
}

/**
 * Avisos de la campana. Con backend: GET /notifications (hasta 10, en español).
 * Si la API falla o aún no tiene la ruta, la campana queda vacía en vez de tumbar la barra.
 */
export async function getNavNotices(): Promise<NavNotice[]> {
  if (!env.useMocks) {
    const rows = await serverApi<ApiNavNotice[]>("/notifications").catch((error: unknown) => {
      if (error instanceof ApiError) return [];
      throw error;
    });
    return rows.map((row): NavNotice => ({ id: row.id, text: row.text, when: row.when, href: row.href, tone: row.tone }));
  }
  return delay(
    [
      { id: "n1", text: "3 hojas de vida ilegibles en Analista de Datos", when: "Hace 20 min", href: "/candidates?job=v-data", tone: "warning" },
      { id: "n2", text: "2 hojas de vida duplicadas en Ingeniero Cloud Senior", when: "Hace 3 h", href: "/candidates?job=v-cloud", tone: "warning" },
      { id: "n3", text: "Daniela Osorio terminó la entrevista con 1 contraste", when: "Ayer 17:54", href: "/interviews/i-1", tone: "warning" },
      { id: "n4", text: "Ingeniero Cloud Senior: 84 hojas de vida evaluadas", when: "Ayer 09:42", href: "/rankings/v-cloud", tone: "success" },
    ],
    50,
  );
}

/** Índice del buscador rápido. Con backend solo vacantes: la API aún no tiene búsqueda de candidatos. */
export async function getSearchIndex(): Promise<SearchItem[]> {
  if (!env.useMocks) {
    try {
      const page = await serverApi<ApiVacancyPage>(vacanciesPath);
      return page.items.map((v): SearchItem => ({ id: `v-${v.id}`, label: v.title, hint: `${v.counts.resumes} hojas de vida`, href: routes.vacancy(v.id), group: "Vacantes" }));
    } catch (error) {
      // Sin empresa la API responde 403; getCurrentUser se encarga de mandar al onboarding.
      if (error instanceof ApiError && error.status === 403) return [];
      throw error;
    }
  }
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
