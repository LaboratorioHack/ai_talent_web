import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMe } from "@/features/auth/api/session";
import { organizationFromEmail } from "@/features/auth/schemas/login";
import { OrganizationStep } from "@/features/onboarding/components/organization-step";
import { routes } from "@/shared/constants/routes";

export const metadata: Metadata = { title: "Organización" };

/** Sesión y /auth/me usan cookies; no prerenderizar de forma instantánea (Next 16 + PPR). */
export const instant = false;

/** Quien ya pertenece a una empresa no la crea otra vez. El nombre sugerido sale del dominio del correo. */
export default async function OnboardingOrganizationPage() {
  const me = await getMe();
  if (me.company) redirect(routes.home);
  return <OrganizationStep detectedName={me.email ? organizationFromEmail(me.email) : null} />;
}
