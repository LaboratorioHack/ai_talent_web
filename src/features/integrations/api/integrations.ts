import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockIntegrationLog, mockIntegrations } from "@/shared/mocks";
import type { Integration, IntegrationLogEntry } from "@/shared/types/domain";

export interface IntegrationsData {
  integrations: Integration[];
  log: IntegrationLogEntry[];
}

/** Fuentes y destinos conectados con su registro. Con backend: GET /integrations. */
export async function getIntegrations(): Promise<IntegrationsData> {
  if (!env.useMocks) return apiFetch<IntegrationsData>("/integrations");
  return delay({ integrations: mockIntegrations, log: mockIntegrationLog });
}
