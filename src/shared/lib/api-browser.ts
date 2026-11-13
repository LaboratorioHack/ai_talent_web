import { env } from "@/config/env";
import { ApiError, apiFetch, type ApiInit } from "./api-client";
import { createSupabaseBrowserClient } from "./supabase/client";

async function accessToken(): Promise<string | undefined> {
  const {
    data: { session },
  } = await createSupabaseBrowserClient().auth.getSession();
  return session?.access_token;
}

/** Llamada a la API desde el navegador, con el token de la sesión de Supabase. */
export async function browserApi<T>(path: string, init: Omit<ApiInit, "token"> = {}): Promise<T> {
  return apiFetch<T>(path, { ...init, token: await accessToken() });
}

export interface ApiFile {
  bytes: Uint8Array;
  contentType: string;
}

/** Descarga un archivo de la API (p. ej. una hoja de vida) con la sesión. 404 → null. */
export async function browserFile(path: string): Promise<ApiFile | null> {
  const token = await accessToken();
  const response = await fetch(`${env.apiUrl}${path}`, { cache: "no-store", headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (response.status === 404) return null;
  if (!response.ok) throw new ApiError(response.status, response.statusText);
  return { bytes: new Uint8Array(await response.arrayBuffer()), contentType: response.headers.get("Content-Type") ?? "application/octet-stream" };
}
