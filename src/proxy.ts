import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/config/env";
import { routes } from "@/shared/constants/routes";
import { accountHome, accountTypeOf, redirectForAccount } from "@/shared/lib/account-type";

/**
 * Rutas sin sesión. /jobs y /interview/ son del candidato, que no tiene cuenta de empresa.
 * /api/ es la API .NET reenviada en local: valida el JWT por su cuenta y tiene rutas públicas (postularse).
 */
const PUBLIC_PREFIXES = ["/login", "/auth", "/design", "/jobs", "/interview/", "/portal/sign-in", "/landing", "/api/", "/_next", "/favicon.ico"];

/**
 * Refresca la sesión de Supabase en cada petición y protege el panel.
 * Chequeo optimista: la autorización real la hace la API .NET con el JWT.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // "/" es la landing pública.
  const isPublic = pathname === "/" || PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));

  // Si el dominio no está en las Redirect URLs de Supabase, el enlace del correo cae en el
  // Site URL ("/") con ?code o ?error. Se pasa al callback, que sabe a qué portal volver.
  const { searchParams } = request.nextUrl;
  if (pathname === "/" && (searchParams.has("code") || searchParams.has("error"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

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

  // Una cuenta es de postulante o de empresa. Con sesión, las dos entradas llevan a su propio inicio,
  // y abrir el lado contrario (el panel o el onboarding siendo postulante, el portal siendo empresa)
  // devuelve a la persona al suyo. La API aplica la misma regla a los datos.
  const type = accountTypeOf(user);
  if (user && (pathname === routes.login || pathname === routes.portalSignIn)) {
    // Con ?error el enlace falló: se deja ver el mensaje aunque haya una sesión anterior.
    if (!searchParams.has("error")) return NextResponse.redirect(new URL(type ? accountHome(type) : routes.home, request.url));
  }
  if (user && type && !isPublic) {
    const own = redirectForAccount(type, pathname);
    if (own) return NextResponse.redirect(new URL(own, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mjs)$).*)"],
};
