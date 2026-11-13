"use client";

import { ApiError } from "@/shared/lib/api-client";
import { browserApi } from "@/shared/lib/api-browser";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";
import type { PortalApplication } from "../types/portal";

/** Lo que el postulante hace desde el portal (ai_talent_back, CandidateSideEndpoints.cs). */

/** POST /me/applications/{id}/withdraw: deja de participar; la API cancela su entrevista pendiente. */
export function withdrawApplication(id: string): Promise<PortalApplication> {
  return browserApi<PortalApplication>(`/me/applications/${id}/withdraw`, { method: "POST" });
}

/**
 * POST /me/resume: guarda una nueva versión de la hoja de vida en cada empresa a la que se postuló
 * y Criba AI la vuelve a leer. Las evaluaciones siguientes usan esta versión.
 */
export async function uploadMyResume(file: File): Promise<{ companies: number; status: string }> {
  const body = new FormData();
  body.set("file", file);
  return browserApi(`/me/resume`, { method: "POST", body });
}

export function uploadErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status === 400) return "La hoja de vida debe ser PDF o Word (.docx) de hasta 10 MB.";
  if (error instanceof ApiError && error.status === 404) return "Postúlate primero a una vacante: tu hoja de vida se guarda con tus postulaciones.";
  if (error instanceof ApiError && error.status === 429) return "Hiciste demasiados intentos. Espera unos minutos.";
  return "No pudimos guardar tu hoja de vida. Intenta de nuevo.";
}

/** GET /me/export: todo lo que Criba guarda de la persona, descargado como JSON (Habeas Data). */
export async function downloadMyData(): Promise<void> {
  const data = await browserApi<unknown>("/me/export");
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "mis-datos-criba.json";
  link.click();
  URL.revokeObjectURL(url);
}

/** DELETE /me: borra hojas de vida, postulaciones, evaluaciones y entrevistas; luego cierra la sesión. */
export async function eraseMyData(): Promise<void> {
  await browserApi("/me", { method: "DELETE" });
  await createSupabaseBrowserClient().auth.signOut();
}
