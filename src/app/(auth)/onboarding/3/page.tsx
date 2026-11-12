import type { Metadata } from "next";
import { FirstVacancyStep } from "@/features/onboarding/components/first-vacancy-step";
import { exampleRoleProfileDraft } from "@/features/vacancies/api/role-profiles";

export const metadata: Metadata = { title: "Primera vacante" };

/** Paso 3 de 3. Las fuentes (ATS y portales) quedan fuera del MVP. */
export default function OnboardingFirstVacancyPage() {
  return <FirstVacancyStep initial={exampleRoleProfileDraft()} />;
}
