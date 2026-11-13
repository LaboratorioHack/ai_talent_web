import { browserApi, browserFile, type ApiFile } from "./api-browser";

/**
 * Acciones del equipo sobre una postulación que usan varias pantallas (ranking, postulaciones,
 * entrevistas). ai_talent_back: VacancyEndpoints.cs y CandidateSideEndpoints.cs.
 */

/** El archivo que envió la persona; null si ya no está en el almacenamiento. La descarga queda auditada. */
export function getResumeFile(vacancyId: string, applicationId: string): Promise<ApiFile | null> {
  return browserFile(`/vacancies/${vacancyId}/applications/${applicationId}/resume/file`);
}

export const isPdf = (file: ApiFile) => file.contentType.includes("pdf");

/** Pide a la persona que vuelva a enviar su hoja de vida (correo + auditoría). */
export async function requestOriginal(vacancyId: string, applicationId: string): Promise<void> {
  await browserApi(`/vacancies/${vacancyId}/applications/${applicationId}/request-original`, { method: "POST" });
}

/** Descarta con motivo: la etapa pasa a REJECTED y el motivo queda en la auditoría. */
export async function rejectApplication(vacancyId: string, applicationId: string, reason: string): Promise<void> {
  await browserApi(`/vacancies/${vacancyId}/applications/${applicationId}`, { method: "PATCH", body: JSON.stringify({ status: "REJECTED", reason }) });
}

/** Guarda el archivo en el equipo de la persona que lo pidió. */
export function saveFile(file: ApiFile, name: string): void {
  const url = URL.createObjectURL(new Blob([file.bytes as BlobPart], { type: file.contentType }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}
