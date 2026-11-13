"use client";

import { routes } from "@/shared/constants/routes";
import { rememberAuthNext } from "@/shared/lib/auth-redirect";
import { createSupabaseBrowserClient } from "@/shared/lib/supabase/client";
import type { LoginInput } from "../schemas/login";

export type AuthResult = { ok: true } | { ok: false; message: string };

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos",
  email_not_confirmed: "Confirma tu correo antes de entrar",
  over_request_rate_limit: "Demasiados intentos. Espera un momento",
};

function humanize(code: string | undefined, fallback: string): string {
  return (code && MESSAGES[code]) ?? fallback;
}

/** Correo + contraseña con Supabase Auth. */
export async function signInWithPassword(input: LoginInput): Promise<AuthResult> {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { ok: false, message: humanize(error.code, error.message) };
  return { ok: true };
}

/**
 * Enlace para restablecer la contraseña. Supabase manda el correo y vuelve por
 * /auth/callback. Por seguridad respondemos igual exista o no la cuenta.
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createSupabaseBrowserClient();
  rememberAuthNext(routes.home);
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/auth/callback?next=${routes.home}` });
  if (error?.code === "over_request_rate_limit" || error?.code === "over_email_send_rate_limit") return { ok: false, message: MESSAGES.over_request_rate_limit };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
