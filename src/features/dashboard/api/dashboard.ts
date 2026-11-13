import "server-only";

import { serverApi } from "@/shared/lib/api-server";
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

/** Algo que hizo Criba AI con una hoja de vida (ai_talent_back, AiActivityRow). */
export interface AiActivityItem {
  kind: "read" | "unreadable" | "evaluated" | "interview";
  at: string;
  jobTitle: string;
  fileName: string | null;
  pages: number | null;
  fulfillment: "MEETS" | "PARTIALLY_MEETS" | "DOES_NOT_MEET" | null;
  position: number | null;
  of: number | null;
}

export interface DashboardData {
  organization: string;
  vacancies: { id: string; title: string; closesAt: string; byPeriod: Record<Period, PeriodStats> }[];
  topProfiles: { applicationId: string; vacancyId: string; name: string; vacancy: string; score: number }[];
  pending: PendingItem[];
  activity: AiActivityItem[];
}

/** Panel de inicio: GET /dashboard (todos los períodos en una respuesta, calculados de los datos reales). */
export function getDashboard(): Promise<DashboardData> {
  return serverApi<DashboardData>("/dashboard");
}
