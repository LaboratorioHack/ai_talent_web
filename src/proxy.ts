import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";
import { routes } from "@/shared/constants/routes";

/** Rutas sin sesión. /jobs y /interview/ son del candidato, que no tiene cuenta de empresa. */
const PUBLIC_PREFIXES = ["/login", "/auth", "/design", "/jobs", "/interview/", "/portal/sign-in", "/landing", "/_next", "/favicon.ico"];

/**
 * Refresca la sesión de Supabase en cada petición y protege el panel.
 * Chequeo optimista: la autorización real la hace la API .NET con el JWT.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // "/" es la landing pública.
  const isPublic = pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  // Sin Supabase configurado (modo mock) no hay sesión que proteger.
  if (!env.supabaseUrl || !env.supabaseAnonKey) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    // El portal del postulante tiene su propia entrada (enlace mágico).
    const portal = pathname.startsWith(routes.portal);
    url.pathname = portal ? routes.portalSignIn : routes.login;
    if (!portal) url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && pathname === routes.login) {
    return NextResponse.redirect(new URL(routes.home, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)"],
};
