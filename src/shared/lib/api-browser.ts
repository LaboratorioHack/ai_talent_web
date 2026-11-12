import { apiFetch, type ApiInit } from "./api-client";
import { createSupabaseBrowserClient } from "./supabase/client";

/** Llamada a la API desde el navegador, con el token de la sesión de Supabase. */
export async function browserApi<T>(path: string, init: Omit<ApiInit, "token"> = {}): Promise<T> {
  const {
    data: { session },
  } = await createSupabaseBrowserClient().auth.getSession();
  return apiFetch<T>(path, { ...init, token: session?.access_token });
}
