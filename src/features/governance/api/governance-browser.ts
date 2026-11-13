import { browserApi } from "@/shared/lib/api-browser";
import { PERIOD_DAYS, type GovernanceData, type GovernancePeriod } from "../types";

/** La misma auditoría para otro período, pedida desde la pantalla al cambiar el filtro. */
export function fetchGovernance(period: GovernancePeriod): Promise<GovernanceData> {
  return browserApi<GovernanceData>(`/governance/audit?days=${PERIOD_DAYS[period]}`);
}
