import "server-only";

import { apiFetch, type ApiInit } from "./api-client";
import { createSupabaseServerClient } from "./supabase/server";

/** Llamada a la API desde un Server Component, con el token de la sesión en cookies. */
export async function serverApi<T>(path: string, init: Omit<ApiInit, "token"> = {}): Promise<T> {
  const supabase = await createSupabaseServerClient();
  // El proxy ya validó al usuario con getUser(); aquí solo hace falta el JWT, que la API verifica.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return apiFetch<T>(path, { ...init, token: session?.access_token });
}
