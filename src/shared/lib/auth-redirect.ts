/**
 * A dónde volver después del enlace mágico de Supabase. Si el dominio no está en las
 * Redirect URLs de Supabase, el correo cae en el Site URL sin `next`: la cookie lo recupera.
 */
export const AUTH_NEXT_COOKIE = "criba-auth-next";

/** Solo rutas internas: evita redirecciones abiertas como //otro-sitio o /\otro-sitio. */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null;
  return value;
}

/** Se llama en el navegador justo antes de pedir el enlace; dura lo mismo que el enlace (1 h). */
export function rememberAuthNext(path: string): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(path)}; Path=/; Max-Age=3600; SameSite=Lax${secure}`;
}
