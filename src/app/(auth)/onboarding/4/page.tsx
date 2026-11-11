import type { Metadata } from "next";
import { FirstVacancyStep } from "@/features/onboarding/components/first-vacancy-step";
import { exampleRoleProfileDraft } from "@/features/vacancies/api/role-profiles";

export const metadata: Metadata = { title: "Primera vacante" };

/** Paso 4 de 4. */
export default function OnboardingFirstVacancyPage() {
  return <FirstVacancyStep initial={exampleRoleProfileDraft()} />;
}
