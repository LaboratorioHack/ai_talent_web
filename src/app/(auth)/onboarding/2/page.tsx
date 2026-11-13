import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMe } from "@/features/auth/api/session";
import { organizationFromEmail } from "@/features/auth/schemas/login";
import { OrganizationStep } from "@/features/onboarding/components/organization-step";
import { routes } from "@/shared/constants/routes";
import { createSupabaseServerClient } from "@/shared/lib/supabase/server";

export const metadata: Metadata = { title: "Organización" };

/** Sesión y /auth/me usan cookies; no prerenderizar de forma instantánea (Next 16 + PPR). */
export const instant = false;

/**
 * Quien ya pertenece a una empresa no la crea otra vez. La organización sugerida sale del dominio
 * del correo; el nombre de la persona, del perfil de Auth si lo tenía (las cuentas nuevas no).
 */
export default async function OnboardingOrganizationPage() {
  const me = await getMe();
  if (me.company) redirect(routes.home);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const personName = typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : "";
  return <OrganizationStep detectedName={me.email ? organizationFromEmail(me.email) : null} suggestedPersonName={personName} />;
}
