"use client";

import { usePathname } from "next/navigation";
import { Steps } from "@/shared/components/ui";

export const ONBOARDING_STEPS = ["Cuenta", "Organización", "Fuentes", "Primera vacante"];

/** Lee el paso actual de la URL (/onboarding/2 → índice 1). */
export function OnboardingSteps() {
  const pathname = usePathname();
  const step = Number(pathname.split("/").pop());
  const current = Number.isFinite(step) && step >= 1 && step <= 4 ? step - 1 : 1;
  return <Steps steps={ONBOARDING_STEPS} current={current} />;
}
