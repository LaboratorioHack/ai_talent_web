import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";
import { routes } from "@/shared/constants/routes";
import { redirectForAccount } from "@/shared/lib/account-type";
import { ensureAccountType } from "@/shared/lib/account-type-server";
import { AUTH_NEXT_COOKIE, safeNextPath } from "@/shared/lib/auth-redirect";

/**
 * Dominio público de la app. Detrás de Caddy, `request.url` puede traer el host
 * interno del contenedor (localhost:3000); Caddy pone el real en X-Forwarded-Host.
 */
function publicOrigin(request: NextRequest): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || url.protocol.replace(":", "");
  return host ? `${proto}://${host}` : url.origin;
}

/** Destino del enlace mágico de Supabase Auth (`?code`, PKCE): empresas y postulantes. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const remembered = request.cookies.get(AUTH_NEXT_COOKIE)?.value;
  const next = safeNextPath(searchParams.get("next")) ?? safeNextPath(remembered ? decodeURIComponent(remembered) : null) ?? routes.home;

  let target = next;
  let exchanged = false;
  if (code) {
    const supabase = await createSupabaseServerClient();
    exchanged = !(await supabase.auth.exchangeCodeForSession(code)).error;
    if (exchanged) {
      // Una cuenta es de postulante o de empresa: si entró por el lado que no es el suyo, va a su inicio.
      const type = await ensureAccountType(supabase, next);
      if (type) target = redirectForAccount(type, next) ?? next;
    }
  }
  if (!exchanged) {
    // El postulante vuelve a su propia entrada, nunca al login de empresas.
    // Con ?error vuelve de Google/Microsoft (cancelado o rechazado); sin código, el enlace del correo ya no sirve.
    const reason = searchParams.has("error") ? "oauth" : null;
    target = next.startsWith(routes.portal) ? `${routes.portalSignIn}?error=${reason ?? "link"}` : `${routes.login}?error=${reason ?? "auth"}`;
  }

  const response = NextResponse.redirect(`${publicOrigin(request)}${target}`);
  response.cookies.delete(AUTH_NEXT_COOKIE);
  return response;
}
