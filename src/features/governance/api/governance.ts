import "server-only";

import { serverApi } from "@/shared/lib/api-server";
import type { GovernanceData } from "../types";

/** Auditoría de la IA de la organización en los últimos 30 días: GET /governance/audit. */
export function getGovernance(): Promise<GovernanceData> {
  return serverApi<GovernanceData>("/governance/audit?days=30");
}
