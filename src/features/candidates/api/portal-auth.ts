"use client";

import { ApiError, apiFetch } from "@/shared/lib/api-client";

/**
 * Enlace mágico para entrar al portal del postulante: lo crea la API y lo manda por el correo de
 * Criba (POST /public/portal-link), así no depende del límite de correos de Supabase. El enlace
 * abre /auth/confirm, que deja la sesión. Devuelve "sent" o un mensaje para la persona.
 */
export async function sendPortalLink(email: string): Promise<"sent" | string> {
  try {
    await apiFetch("/public/portal-link", { method: "POST", body: JSON.stringify({ email }) });
    return "sent";
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) return "Pediste varios enlaces seguidos. Espera unos minutos";
    if (error instanceof ApiError && error.status === 400) return "Escribe un correo válido";
    return "No pudimos enviar el enlace. Intenta de nuevo en un momento";
  }
}
