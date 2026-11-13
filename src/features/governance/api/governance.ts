import "server-only";

import { env } from "@/config/env";
import { serverApi } from "@/shared/lib/api-server";
import { delay, mockAttributes, mockAuditStats, mockDecisions, mockUser, mockVacancies } from "@/shared/mocks";
import type { AuditDecision } from "@/shared/types/domain";

export interface BiasAlert {
  id: string;
  vacancy: string;
  text: string;
  detail: string;
}

export interface GovernanceData {
  organization: string;
  stats: typeof mockAuditStats & { aiErrorsFlagged: number };
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
  { when: "Vie", action: "Invitó a entrevista", who: "Ana M.", subject: "Andrés Pardo", status: "partial" },
  { when: "Jue", action: "Descartó por no cumplir un obligatorio", who: "Carlos P.", subject: "Ricardo Méndez", status: "does_not_meet" },
  { when: "Jue", action: "Corrigió una cita de la IA", who: "Ana M.", subject: "Mariana López", status: "partial" },
  { when: "Jue", action: "Re-evaluó 40 por cambio de perfil", who: "Sistema", subject: "Backend Jr", status: "unevaluated" },
  { when: "Mié", action: "Marcó finalista", who: "Carlos P.", subject: "Diana Restrepo", status: "meets" },
  { when: "Mié", action: "Invitó a entrevista", who: "Carlos P.", subject: "Valentina Cruz", status: "meets" },
  { when: "Mié", action: "Descartó, retiró su postulación", who: "Ana M.", subject: "Tomás Herrera", status: "does_not_meet" },
  { when: "Mar", action: "Cambió el peso de Kubernetes de 15 a 20", who: "Ana M.", subject: "Cloud Senior", status: "unevaluated" },
];

/** Auditoría de la IA de la organización. Con backend: GET /governance/audit. */
export async function getGovernance(): Promise<GovernanceData> {
  if (!env.useMocks) return serverApi<GovernanceData>("/governance/audit");
  return delay({
    organization: mockUser.company.name,
    stats: {
      ...mockAuditStats,
      resumesEvaluated: mockVacancies.reduce((n, v) => n + v.stats.meets + v.stats.partial + v.stats.doesNotMeet, 0),
      humanDecisions: [...mockDecisions, ...MORE].filter((d) => d.who !== "Sistema").length,
      aiErrorsFlagged: [...mockDecisions, ...MORE].filter((d) => /falso positivo|Corrigió/.test(d.action)).length,
    },
    attributes: mockAttributes,
    decisions: [...mockDecisions, ...MORE],
    // Las alertas de sesgo solo salen de un cálculo real del backend; el mock no inventa ninguna.
    alerts: [],
  });
}
