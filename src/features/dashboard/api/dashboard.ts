import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockApplications, mockPending, mockUser, mockVacancies } from "@/shared/mocks";
import type { PendingItem } from "@/shared/types/domain";

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

export interface DailyPoint {
  /** "3 nov" */
  label: string;
  received: number;
  evaluated: number;
}

export interface DashboardData {
  organization: string;
  vacancies: { id: string; title: string; closesAt: string; byPeriod: Record<Period, PeriodStats> }[];
  /** Hojas de vida por día de toda la organización. */
  daily: Record<Period, DailyPoint[]>;
  topProfiles: { applicationId: string; name: string; vacancy: string; score: number }[];
  pending: PendingItem[];
}

const SCALE: Record<Period, number> = { "7d": 0.32, "30d": 1, "90d": 2.6 };
const DAYS: Record<Period, number> = { "7d": 7, "30d": 30, "90d": 90 };
const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** Serie diaria determinista (sin azar) para que el mock no cambie entre recargas. */
function dailySeries(days: number, total: number): DailyPoint[] {
  const end = new Date(2026, 10, 11);
  const weights = Array.from({ length: days }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (days - 1 - i));
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    return (weekend ? 0.35 : 1) * (1 + 0.45 * Math.sin(i * 0.9) + 0.25 * Math.cos(i * 0.37)) * (0.7 + (i / days) * 0.6);
  });
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map((w, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (days - 1 - i));
    const received = Math.max(0, Math.round((w / sum) * total));
    return { label: `${d.getDate()} ${MONTHS[d.getMonth()]}`, received, evaluated: Math.round(received * (0.82 + 0.12 * Math.sin(i))) };
  });
}

/** Datos del panel de inicio. Con backend: GET /dashboard (todos los períodos en una respuesta). */
export async function getDashboard(): Promise<DashboardData> {
  if (!env.useMocks) return apiFetch<DashboardData>("/dashboard");

  const open = mockVacancies.filter((v) => v.status === "OPEN");
  const scaled = (s: PeriodStats, p: Period): PeriodStats =>
    Object.fromEntries(Object.entries(s).map(([k, n]) => [k, Math.round(n * SCALE[p])])) as unknown as PeriodStats;

  const vacancies = open.map((v) => ({
    id: v.id,
    title: v.title,
    closesAt: v.closesAt,
    byPeriod: { "7d": scaled(v.stats, "7d"), "30d": scaled(v.stats, "30d"), "90d": scaled(v.stats, "90d") },
  }));
  const total = (p: Period) => vacancies.reduce((n, v) => n + v.byPeriod[p].received, 0);

  return delay({
    organization: mockUser.company.name,
    vacancies,
    daily: { "7d": dailySeries(DAYS["7d"], total("7d")), "30d": dailySeries(DAYS["30d"], total("30d")), "90d": dailySeries(DAYS["90d"], total("90d")) },
    topProfiles: mockApplications
      .filter((a) => a.evaluation)
      .sort((a, b) => (b.evaluation?.totalScore ?? 0) - (a.evaluation?.totalScore ?? 0))
      .slice(0, 5)
      .map((a) => ({ applicationId: a.id, name: a.candidate.name, vacancy: "Ingeniero Cloud Senior", score: a.evaluation?.totalScore ?? 0 })),
    pending: mockPending,
  });
}
