import type { Metadata } from "next";
import { SourcesStep } from "@/features/onboarding/components/sources-step";

export const metadata: Metadata = { title: "Fuentes" };

/** Paso 3 de 4. */
export default function OnboardingSourcesPage() {
  return <SourcesStep />;
}
