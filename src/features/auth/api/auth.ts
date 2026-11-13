"use client";

import { rememberAuthNext } from "@/shared/lib/auth-redirect";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";

const MESSAGES: Record<string, string> = {
  // Este límite es de todo el proyecto en Supabase (no de esta persona): muchos enlaces en la última hora.
  over_email_send_rate_limit: "Ahora mismo no podemos enviar más enlaces. Entra con Google o Microsoft, o intenta en unos minutos",
  over_request_rate_limit: "Pediste varios enlaces seguidos. Espera unos minutos",
  email_address_invalid: "Escribe un correo válido",
  validation_failed: "Escribe un correo válido",
  signup_disabled: "El registro está cerrado. Pide acceso a quien administra Criba",
};

/**
 * Entrada y registro sin contraseña con Supabase Auth: `signInWithOtp` crea la cuenta la primera
 * vez y Supabase manda el correo con el enlace. El enlace vuelve a /auth/callback, que canjea el
 * código y lleva a `next`. Devuelve "sent" o un mensaje para la persona.
 */
export async function sendSignInLink(email: string, next: string): Promise<"sent" | string> {
  // Si el dominio no está en las Redirect URLs de Supabase, el enlace cae en el Site URL sin `next`:
  // la cookie lo recupera.
  rememberAuthNext(next);
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (!error) return "sent";
  return (error.code && MESSAGES[error.code]) ?? "No pudimos enviar el enlace. Intenta de nuevo en un momento";
}

/** Proveedores OAuth habilitados en Supabase Auth: Google y Microsoft (Azure / Entra ID). */
export type OAuthProvider = "google" | "azure";

/**
 * Entrada con Google o Microsoft por Supabase Auth. Redirige el navegador al proveedor; al volver,
 * /auth/callback canjea el código y lleva a `next`. La primera vez crea la cuenta. Solo devuelve si
 * no pudo empezar el flujo.
 */
export async function signInWithProvider(provider: OAuthProvider, next: string): Promise<string | null> {
  rememberAuthNext(next);
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      // Microsoft no entrega el correo sin el scope "email"; sin correo Supabase no crea la cuenta.
      scopes: provider === "azure" ? "email" : undefined,
    },
  });
  return error ? "No pudimos abrir el inicio de sesión. Intenta de nuevo" : null;
}

export async function signOut(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
