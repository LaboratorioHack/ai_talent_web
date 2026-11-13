import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { routes } from "@/shared/constants/routes";
import { safeNextPath } from "@/shared/lib/auth-redirect";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

const TYPES: EmailOtpType[] = ["magiclink", "email", "recovery", "invite"];

/** Dominio público detrás de Caddy (X-Forwarded-Host), no el host interno del contenedor. */
function publicOrigin(request: NextRequest): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host")?.split(",")[0].trim() || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0].trim() || url.protocol.replace(":", "");
  return host ? `${proto}://${host}` : url.origin;
}

/**
 * Destino de enlaces con `token_hash` (plantillas de correo de Supabase que no usan PKCE):
 * verifica el token de un solo uso con Supabase y deja la sesión en las cookies.
 */
export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams;
  const tokenHash = params.get("token_hash");
  const type = params.get("type") as EmailOtpType | null;
  const next = safeNextPath(params.get("next")) ?? routes.portal;

  let ok = false;
  if (tokenHash && type && TYPES.includes(type)) {
    const supabase = await createSupabaseServerClient();
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const target = ok ? next : next.startsWith(routes.portal) ? `${routes.portalSignIn}?error=link` : `${routes.login}?error=auth`;
  return NextResponse.redirect(`${publicOrigin(request)}${target}`);
}
