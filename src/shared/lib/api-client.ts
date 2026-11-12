import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface ApiInit extends RequestInit {
  /** JWT de Supabase; la API .NET rechaza toda ruta sin él salvo las públicas. */
  token?: string | null;
}

/** La API responde errores como ProblemDetails; `detail` trae el motivo legible. */
async function errorMessage(response: Response): Promise<string> {
  const text = await response.text();
  try {
    const problem = JSON.parse(text) as { detail?: string; title?: string };
    return problem.detail ?? problem.title ?? text;
  } catch {
    return text || response.statusText;
  }
}

/**
 * Cliente HTTP base hacia la API .NET. Las features con sesión pasan por
 * `api-server` (Server Components) o `api-browser` (componentes cliente),
 * que le ponen el token.
 */
export async function apiFetch<T>(path: string, { token, ...init }: ApiInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  // Con FormData el navegador pone el boundary del multipart.
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const base = typeof window === "undefined" ? env.serverApiUrl : env.apiUrl;
  const response = await fetch(`${base}${path}`, { cache: "no-store", ...init, headers });

  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }
  if (response.status === 204) return undefined as T;

  return (await response.json()) as T;
}
