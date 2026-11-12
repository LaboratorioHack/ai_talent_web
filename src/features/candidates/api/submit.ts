"use client";

import { env } from "@/config/env";
import { delay } from "@/shared/mocks";
import type { ApplicationInput } from "../schemas/application";

export type SubmitResult = { ok: true } | { ok: false; message: string };

/**
 * Envía la postulación: crea la aplicación con source = CANDIDATE y sube la
 * hoja de vida al bucket privado. Con backend: POST /public/vacancies/{id}/applications (multipart).
 */
export async function submitApplication(jobId: string, input: ApplicationInput): Promise<SubmitResult> {
  if (env.useMocks) return delay({ ok: true }, 1200);
  const body = new FormData();
  body.set("name", input.name);
  body.set("email", input.email);
  body.set("resume", input.resume);
  body.set("consent", "true");
  const res = await fetch(`${env.apiUrl}/public/vacancies/${jobId}/applications`, { method: "POST", body });
  if (res.status === 409) return { ok: false, message: "Ya te postulaste a esta vacante con este correo" };
  if (!res.ok) return { ok: false, message: "No pudimos enviar tu postulación. Intenta de nuevo" };
  return { ok: true };
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
