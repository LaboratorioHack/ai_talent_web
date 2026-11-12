"use client";

import { routes } from "@/shared/constants/routes";
import { rememberAuthNext } from "@/shared/lib/auth-redirect";
import { createSupabaseBrowserClient, supabaseConfigured } from "@/shared/lib/supabase/client";
import { delay } from "@/shared/mocks";

/**
 * Enlace mágico para entrar al portal del postulante. Devuelve "mock" si no
 * hay Supabase (entra directo), "sent" si salió el correo o un mensaje de error.
 * El enlace vuelve al dominio desde el que se pidió (el desplegado en producción)
 * y termina en /portal, no en el panel de empresas.
 */
export async function sendPortalLink(email: string): Promise<"mock" | "sent" | string> {
  if (!supabaseConfigured) return delay("mock" as const, 600);
  const supabase = createSupabaseBrowserClient();
  rememberAuthNext(routes.portal);
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${routes.portal}`, shouldCreateUser: true },
  });
  if (error) return error.code === "over_email_send_rate_limit" ? "Demasiados intentos. Espera un momento" : "No pudimos enviar el enlace. Intenta de nuevo";
  return "sent";
}
