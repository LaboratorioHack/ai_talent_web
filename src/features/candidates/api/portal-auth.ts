"use client";

import { sendSignInLink } from "@/features/auth/api/auth";
import { routes } from "@/shared/constants/routes";

/**
 * Enlace mágico para entrar al portal del postulante: lo manda Supabase Auth y abre /portal.
 * (Antes lo enviaba la API por el SMTP de Criba con POST /public/portal-link, hoy desactivado.)
 */
export function sendPortalLink(email: string): Promise<"sent" | string> {
  return sendSignInLink(email, routes.portal);
}
