import "server-only";

import { env } from "@/config/env";
import { serverApi } from "@/shared/lib/api-server";
import { delay, mockApplications, mockPending, mockUser, mockVacancies } from "@/shared/mocks";
import type { JobOpening, PendingItem } from "@/shared/types/domain";

export type Period = "7d" | "30d" | "90d";

export interface PeriodStats {
  received: number;
  read: number;
  meets: number;
  partial: number;
  doesNotMeet: number;
  interview: number;
  finalist: number;
}

export interface DashboardData {
  organization: string;
  vacancies: { id: string; title: string; closesAt: string; byPeriod: Record<Period, PeriodStats> }[];
  topProfiles: { applicationId: string; name: string; vacancy: string; score: number }[];
  pending: PendingItem[];
}

// Todas las vacantes abrieron en el último mes: 30 y 90 días muestran lo mismo que la lista de vacantes.
const SCALE: Record<Period, number> = { "7d": 0.3, "30d": 1, "90d": 1 };

/** Datos del panel de inicio. Con backend: GET /dashboard (todos los períodos en una respuesta). */
export async function getDashboard(): Promise<DashboardData> {
  if (!env.useMocks) return serverApi<DashboardData>("/dashboard");

  const open = mockVacancies.filter((v) => v.status === "OPEN");
  const scaled = (s: JobOpening["stats"], p: Period): PeriodStats => {
    const base: PeriodStats = {
      received: s.received,
      read: s.read,
      meets: s.meets,
      partial: s.partial,
      doesNotMeet: s.doesNotMeet,
      interview: s.interview,
      finalist: s.finalist ?? 0,
    };
    const k = SCALE[p];
    return {
      received: Math.round(base.received * k),
      read: Math.round(base.read * k),
      meets: Math.round(base.meets * k),
      partial: Math.round(base.partial * k),
      doesNotMeet: Math.round(base.doesNotMeet * k),
      interview: Math.round(base.interview * k),
      finalist: Math.round(base.finalist * k),
    };
  };

  const vacancies = open.map((v) => ({
    id: v.id,
    title: v.title,
    closesAt: v.closesAt,
    byPeriod: { "7d": scaled(v.stats, "7d"), "30d": scaled(v.stats, "30d"), "90d": scaled(v.stats, "90d") },
  }));

  return delay({
    organization: mockUser.company.name,
    vacancies,
    topProfiles: mockApplications
      .filter((a) => a.evaluation)
      .sort((a, b) => (b.evaluation?.totalScore ?? 0) - (a.evaluation?.totalScore ?? 0))
      .slice(0, 5)
      .map((a) => ({ applicationId: a.id, name: a.candidate.name, vacancy: "Ingeniero Cloud Senior", score: a.evaluation?.totalScore ?? 0 })),
    pending: mockPending,
  });
}
