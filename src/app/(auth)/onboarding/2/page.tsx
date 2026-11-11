import type { Metadata } from "next";
import { OrganizationStep } from "@/features/onboarding/components/organization-step";

export const metadata: Metadata = { title: "Organización" };

/** Paso 2 de 3. El paso 1 es /login. */
export default function OnboardingOrganizationPage() {
  return <OrganizationStep detectedName="Bancolombia Digital" />;
}
