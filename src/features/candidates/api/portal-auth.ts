"use client";

import { sendSignInLink } from "@/features/auth/api/auth";
import { routes } from "@/shared/constants/routes";

/**
 * Enlace mágico para entrar como postulante: lo manda Supabase Auth y abre `next` (el portal, o la
 * vacante a la que la persona se iba a postular).
 * (Antes lo enviaba la API por el SMTP de Criba con POST /public/portal-link, hoy desactivado.)
 */
export function sendPortalLink(email: string, next: string = routes.portal): Promise<"sent" | string> {
  return sendSignInLink(email, next);
}
