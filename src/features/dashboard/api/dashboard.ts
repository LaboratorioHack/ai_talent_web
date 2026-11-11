import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockApplications, mockPending, mockUser, mockVacancies } from "@/shared/mocks";
import type { PendingItem } from "@/shared/types/domain";

export interface DashboardData {
  /** "Miércoles 11 de noviembre" (fecha del servidor de la API). */
  today: string;
  organization: string;
  kpis: { openVacancies: number; closingSoon: number; received: number; meets: number; interviews: number; hoursSaved: number };
  funnel: { label: string; value: number }[];
  perVacancy: { id: string; title: string; meets: number; partial: number; doesNotMeet: number; received: number; closesAt: string }[];
  topProfiles: { applicationId: string; name: string; vacancy: string; score: number }[];
  pending: PendingItem[];
}

/** Datos del panel de inicio. Con backend: GET /dashboard. */
export async function getDashboard(): Promise<DashboardData> {
  if (!env.useMocks) return apiFetch<DashboardData>("/dashboard");

  const open = mockVacancies.filter((v) => v.status === "OPEN");
  const sum = (f: (s: (typeof open)[number]["stats"]) => number) => open.reduce((n, v) => n + f(v.stats), 0);
  const received = sum((s) => s.received);

  return delay({
    today: "Miércoles 11 de noviembre",
    organization: mockUser.company.name,
    kpis: {
      openVacancies: open.length,
      closingSoon: open.filter((v) => v.closesAt <= "2026-11-22").length,
      received,
      meets: sum((s) => s.meets),
      interviews: sum((s) => s.interview),
      hoursSaved: Math.round((received * 2.5) / 60),
    },
    funnel: [
      { label: "Recibidas", value: received },
      { label: "Leídas", value: sum((s) => s.read) },
      { label: "Cumplen", value: sum((s) => s.meets) },
      { label: "Entrevista IA", value: sum((s) => s.interview) },
      { label: "Finalistas", value: sum((s) => s.finalist) },
    ],
    perVacancy: open.map((v) => ({
      id: v.id,
      title: v.title,
      meets: v.stats.meets,
      partial: v.stats.partial,
      doesNotMeet: v.stats.doesNotMeet,
      received: v.stats.received,
      closesAt: v.closesAt,
    })),
    topProfiles: mockApplications
      .filter((a) => a.evaluation)
      .sort((a, b) => (b.evaluation?.totalScore ?? 0) - (a.evaluation?.totalScore ?? 0))
      .slice(0, 4)
      .map((a) => ({ applicationId: a.id, name: a.candidate.name, vacancy: "Ingeniero Cloud Senior", score: a.evaluation?.totalScore ?? 0 })),
    pending: mockPending,
  });
}
