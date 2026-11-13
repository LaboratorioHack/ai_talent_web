import { browserApi } from "@/shared/lib/api-browser";

/** Lo que el equipo hace con una entrevista (ai_talent_back, CandidateSideEndpoints.cs). */

export interface ScheduleInput {
  /** "AAAA-MM-DD" */
  date: string;
  time: string;
  durationMin: number;
  guests: string[];
}

/** POST /interviews/{id}/schedule: avisa por correo a la persona y a quienes asisten, y lo deja en la auditoría. */
export async function scheduleWithTeam(interviewId: string, input: ScheduleInput): Promise<void> {
  await browserApi(`/interviews/${interviewId}/schedule`, { method: "POST", body: JSON.stringify(input) });
}

/** Descarta la postulación con su motivo: PATCH /vacancies/{id}/applications/{applicationId} → REJECTED. */
export async function discardAfterInterview(vacancyId: string, applicationId: string, reason: string): Promise<void> {
  await browserApi(`/vacancies/${vacancyId}/applications/${applicationId}`, { method: "PATCH", body: JSON.stringify({ status: "REJECTED", reason }) });
}
