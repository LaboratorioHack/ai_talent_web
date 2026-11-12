import { ApiError } from "@/shared/lib/api-client";

/** Mensajes legibles para errores habituales del AI Engine vía la API .NET. */
export function evaluationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const detail = error.message.toLowerCase();
    if (error.status === 409 || detail.includes("not been processed")) {
      return "La hoja de vida todavía se está leyendo. Espera a que aparezca en «Listas para evaluar».";
    }
    if (error.status === 400 && (detail.includes("requirements") || detail.includes("requisito") || detail.includes("profile"))) {
      return "La vacante no tiene un perfil de cargo con requisitos. Complétalo antes de evaluar.";
    }
    if (error.status === 503 || detail.includes("not available")) {
      return "Criba AI no está disponible en este momento. Intenta de nuevo en unos minutos.";
    }
    if (error.message.trim()) return error.message;
    return "No se pudo completar la evaluación.";
  }
  return "No se pudo completar la evaluación. Revisa tu conexión e inténtalo de nuevo.";
}
