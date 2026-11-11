import "server-only";

import { env } from "@/config/env";
import { apiFetch } from "@/shared/lib/api-client";
import { delay, mockAttributes, mockAuditStats, mockDecisions } from "@/shared/mocks";
import type { AuditDecision } from "@/shared/types/domain";

export interface BiasAlert {
  id: string;
  vacancy: string;
  text: string;
  detail: string;
}

export interface GovernanceData {
  organization: string;
  stats: typeof mockAuditStats;
  attributes: typeof mockAttributes;
  decisions: AuditDecision[];
  alerts: BiasAlert[];
}

const MORE: AuditDecision[] = [
  { when: "Lun", action: "Invitó a entrevista", who: "Carlos P.", subject: "Julián Ríos", status: "meets" },
  { when: "Lun", action: "Descartó por expectativa salarial", who: "Ana M.", subject: "Felipe Arias", status: "does_not_meet" },
  { when: "Dom", action: "Aprobó equivalencia GCP al 80 %", who: "Ana M.", subject: "Cloud Senior", status: "unevaluated" },
  { when: "Vie", action: "Marcó finalista", who: "Carlos P.", subject: "Daniela Osorio", status: "meets" },
  { when: "Vie", action: "Pidió el original de 3 hojas de vida", who: "Ana M.", subject: "Analista de Datos", status: "unevaluated" },
];

/** Auditoría de la IA de la organización. Con backend: GET /governance/audit. */
export async function getGovernance(): Promise<GovernanceData> {
  if (!env.useMocks) return apiFetch<GovernanceData>("/governance/audit");
  return delay({
    organization: "Bancolombia Digital",
    stats: mockAuditStats,
    attributes: mockAttributes,
    decisions: [...mockDecisions, ...MORE],
    alerts: [
      { id: "b1", vacancy: "Analista de Datos", text: "Diferencia de 9 puntos entre egresados de universidades públicas y privadas", detail: "La diferencia viene del requisito de certificación. Revisa si esa certificación es indispensable o si hay equivalencias." },
      { id: "b2", vacancy: "Desarrollador Backend Jr", text: "Pocas hojas de vida con más de 10 años de experiencia pasan el filtro", detail: "El perfil pide máximo 3 años. Si no es intencional, quita el límite: la experiencia de más no debería restar." },
    ],
  });
}
