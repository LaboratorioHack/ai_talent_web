"use client";

import type { Provider } from "@supabase/supabase-js";
import { createSupabaseBrowserClient, supabaseConfigured } from "@/shared/lib/supabase/client";
import { delay } from "@/shared/mocks";
import type { LoginInput } from "../schemas/login";

export type AuthResult = { ok: true } | { ok: false; message: string };

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos",
  email_not_confirmed: "Confirma tu correo antes de entrar",
  over_request_rate_limit: "Demasiados intentos. Espera un momento",
  validation_failed: "Proveedor no habilitado todavía",
};

function humanize(code: string | undefined, fallback: string): string {
  return (code && MESSAGES[code]) ?? fallback;
}

/** Correo + contraseña con Supabase Auth. En modo mock siempre entra. */
export async function signInWithPassword(input: LoginInput): Promise<AuthResult> {
  if (!supabaseConfigured) return delay({ ok: true }, 700);
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithPassword(input);
  if (error) return { ok: false, message: humanize(error.code, error.message) };
  return { ok: true };
}

/** OAuth (Google / Microsoft). Vuelve por /auth/callback. */
export async function signInWithProvider(provider: Extract<Provider, "google" | "azure">, next = "/home"): Promise<AuthResult> {
  if (!supabaseConfigured) return { ok: false, message: "Proveedor no habilitado en este entorno" };
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { ok: false, message: humanize(error.code, "No se pudo iniciar sesión con el proveedor") };
  return { ok: true };
}

export async function signOut(): Promise<void> {
  if (!supabaseConfigured) return;
  const supabase = createSupabaseBrowserClient();
  await supabase.auth.signOut();
}
