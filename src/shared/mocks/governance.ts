import type { AuditDecision } from "@/shared/types/domain";

export const mockAuditStats = {
  sensitiveUsed: 0,
  resumesEvaluated: 1284,
  scoresWithEvidence: 100,
  humanDecisions: 37,
  biasAlerts: 2,
};

export const mockAttributes = [
  { label: "Foto", used: false, note: "se borra al leer" },
  { label: "Edad y fecha de nacimiento", used: false, note: "se borra al leer" },
  { label: "Género", used: false, note: "se borra al leer" },
  { label: "Dirección y ciudad", used: false, note: "se borra al leer" },
  { label: "Nacionalidad", used: false, note: "se borra al leer" },
  { label: "Estado civil", used: false, note: "se borra al leer" },
  { label: "Experiencia", used: true, note: "requisitos" },
  { label: "Educación y certificaciones", used: true, note: "requisitos" },
  { label: "Idiomas", used: true, note: "requisitos" },
  { label: "Competencias técnicas", used: true, note: "requisitos y equivalencias" },
];

export const mockDecisions: AuditDecision[] = [
  { when: "Hoy 10:02", action: "Invitó a entrevista", who: "Ana M.", subject: "Daniela Osorio", status: "meets" },
  { when: "Hoy 09:48", action: "Descartó · no cumple obligatorio", who: "Ana M.", subject: "Julián Rivas", status: "does_not_meet" },
  { when: "Ayer", action: "Cambió el peso de Inglés de 15 a 10", who: "Carlos P.", subject: "Cloud Senior", status: "unevaluated" },
  { when: "Ayer", action: "Marcó falso positivo de IA", who: "Ana M.", subject: "Camila Torres", status: "partial" },
  { when: "Lun", action: "Re-evaluó 84 por cambio de pesos", who: "Sistema", subject: "Cloud Senior", status: "unevaluated" },
];
