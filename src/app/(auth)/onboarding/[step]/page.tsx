import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FirstVacancyStep } from "@/features/onboarding/components/first-vacancy-step";
import { OrganizationStep } from "@/features/onboarding/components/organization-step";
import { SourcesStep } from "@/features/onboarding/components/sources-step";
import { exampleRoleProfileDraft } from "@/features/vacancies/api/role-profiles";

export const metadata: Metadata = { title: "Primeros pasos" };

export function generateStaticParams() {
  return [{ step: "2" }, { step: "3" }, { step: "4" }];
}

/** Pasos 2–4 del onboarding. El paso 1 es /login. */
export default async function OnboardingStepPage({ params }: PageProps<"/onboarding/[step]">) {
  const { step } = await params;
  switch (step) {
    case "2":
      return <OrganizationStep detectedName="Bancolombia Digital" />;
    case "3":
      return <SourcesStep />;
    case "4":
      return <FirstVacancyStep initial={exampleRoleProfileDraft()} />;
    default:
      notFound();
  }
}
