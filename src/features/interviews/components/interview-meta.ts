import type { Interview } from "@/shared/types/domain";

/** Estado de una entrevista: texto y tono del chip. */
export const STATUS: Record<Interview["status"], { label: string; tone: string }> = {
  IN_PROGRESS: { label: "En curso", tone: "bg-blue-soft text-blue" },
  DONE: { label: "Terminada", tone: "bg-success-soft text-success" },
  SCHEDULED: { label: "Invitación enviada", tone: "bg-surface-2 text-ink-2" },
};

/** Sugerencia de Criba al terminar. Siempre la decide una persona. */
export const RECOMMENDATION = {
  ADVANCE: { label: "Sugiere avanzar", tone: "text-success", bg: "bg-success-soft" },
  REVIEW: { label: "Revisa los contrastes", tone: "text-warning", bg: "bg-warning-soft" },
  DO_NOT_ADVANCE: { label: "No sugiere avanzar", tone: "text-danger", bg: "bg-danger-soft" },
} as const;

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

/** "10 nov, 17:40" */
export const when = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
