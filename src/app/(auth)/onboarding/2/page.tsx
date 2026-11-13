import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { getMe } from "@/features/auth/api/session";
import { OrganizationStep } from "@/features/onboarding/components/organization-step";
import { routes } from "@/shared/constants/routes";
import { supabaseConfigured } from "@/shared/lib/supabase/server";

export const metadata: Metadata = { title: "Organización" };

/** Sesión y /auth/me usan cookies; no prerenderizar de forma instantánea (Next 16 + PPR). */
export const instant = false;

/** Paso 2 de 3. El paso 1 es /login. Quien ya pertenece a una empresa no la crea otra vez. */
export default async function OnboardingOrganizationPage() {
  if (supabaseConfigured && !env.useMocks) {
    const me = await getMe();
    if (me.company) redirect(routes.home);
  }
  return <OrganizationStep detectedName="Cordillera Financiera" />;
}
