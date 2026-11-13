import { routes } from "@/shared/constants/routes";

/**
 * Una cuenta es de postulante o de empresa, nunca las dos: quien se postula no puede evaluar
 * vacantes, ni al revés. El tipo se fija la primera vez que la persona entra (según por dónde
 * entró) y queda en `user_metadata.account_type` de Supabase.
 *
 * Aquí solo se decide a qué parte de la app va cada cuenta. La regla dura la aplica la API .NET:
 * rechaza que una cuenta con postulaciones cree o se una a una empresa, y que una cuenta de
 * empresa se postule.
 */
export type AccountType = "applicant" | "company";

export const ACCOUNT_TYPE_KEY = "account_type";

/** Rutas del postulante: su portal, las vacantes públicas y la entrevista. */
const APPLICANT_PREFIXES = [routes.portal, "/jobs", "/interview"];

export function isApplicantPath(pathname: string): boolean {
  return APPLICANT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/** Tipo guardado en la cuenta; null si todavía no tiene (cuentas anteriores a esta regla). */
export function accountTypeOf(user: { user_metadata?: Record<string, unknown> | null } | null | undefined): AccountType | null {
  const value = user?.user_metadata?.[ACCOUNT_TYPE_KEY];
  return value === "applicant" || value === "company" ? value : null;
}

/** Tipo que le toca a una cuenta nueva según a dónde iba al entrar. */
export function accountTypeForPath(next: string): AccountType {
  return isApplicantPath(next) ? "applicant" : "company";
}

/** Inicio de cada tipo de cuenta. */
export function accountHome(type: AccountType): string {
  return type === "applicant" ? routes.portal : routes.home;
}

/**
 * A dónde debe ir una cuenta que intenta abrir `pathname`: su propio inicio si la ruta es del
 * otro tipo de cuenta, o null si puede quedarse.
 */
export function redirectForAccount(type: AccountType, pathname: string): string | null {
  const applicantPath = isApplicantPath(pathname);
  if (type === "applicant") return applicantPath ? null : routes.portal;
  // Una cuenta de empresa puede ver las vacantes públicas (para compartirlas), pero no el portal.
  return pathname === routes.portal || pathname.startsWith(`${routes.portal}/`) ? routes.home : null;
}
