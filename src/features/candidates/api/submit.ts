"use client";

import { env } from "@/config/env";
import { apiFetch, ApiError } from "@/shared/lib/api-client";
import { delay } from "@/shared/mocks";
import type { ApplicationInput } from "../schemas/application";

export type SubmitResult = { ok: true } | { ok: false; message: string };

/** La API responde 409 por motivos distintos; el texto de ProblemDetails dice cuál. */
function conflictMessage(detail: string): string {
  if (/already applied/i.test(detail)) return "Ya te postulaste a esta vacante con este correo";
  if (/not accepting|no longer accepting/i.test(detail)) return "Esta vacante ya no recibe postulaciones";
  return "No pudimos enviar tu postulación. Intenta de nuevo";
}

/**
 * Envía la postulación: crea la aplicación con source = CANDIDATE y sube la
 * hoja de vida al bucket privado. Ruta pública (sin sesión) de la API:
 * POST /vacancies/{id}/applications (multipart con name, email, consent y file).
 */
export async function submitApplication(jobId: string, input: ApplicationInput): Promise<SubmitResult> {
  if (env.useMocks) return delay({ ok: true }, 1200);
  const body = new FormData();
  body.set("name", input.name);
  body.set("email", input.email);
  body.set("consent", "true");
  body.set("file", input.resume);
  try {
    await apiFetch(`/vacancies/${jobId}/applications`, { method: "POST", body });
    return { ok: true };
  } catch (error) {
    if (!(error instanceof ApiError)) return { ok: false, message: "No pudimos conectarnos. Revisa tu conexión e intenta de nuevo" };
    if (error.status === 409) return { ok: false, message: conflictMessage(error.message) };
    if (error.status === 404) return { ok: false, message: "Esta vacante ya no existe" };
    if (error.status === 429) return { ok: false, message: "Hiciste demasiados intentos. Espera unos minutos" };
    if (error.status === 400) return { ok: false, message: "Revisa tus datos: la hoja de vida debe ser PDF o Word (.docx) de hasta 10 MB" };
    return { ok: false, message: "No pudimos enviar tu postulación. Intenta de nuevo" };
  }
}

/** Guarda una respuesta de la entrevista. Con backend: POST /public/interviews/{token}/turns. */
export async function sendInterviewAnswer(token: string, order: number, answer: string): Promise<void> {
  if (env.useMocks) return delay(undefined, 300);
  await fetch(`${env.apiUrl}/public/interviews/${token}/turns`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order, answer }),
  });
}
