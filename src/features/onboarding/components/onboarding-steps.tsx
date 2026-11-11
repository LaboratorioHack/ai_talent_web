"use client";

import { usePathname } from "next/navigation";
import { Steps } from "@/shared/components/ui";

export const ONBOARDING_STEPS = ["Cuenta", "Organización", "Fuentes", "Primera vacante"];

/** Lee el paso actual de la URL: /onboarding/2 es el índice 1; /onboarding/listo marca los cuatro como hechos. */
export function OnboardingSteps() {
  const pathname = usePathname();
  const last = pathname.split("/").pop();
  const step = Number(last);
  const current = last === "listo" ? 4 : Number.isFinite(step) && step >= 1 && step <= 4 ? step - 1 : 1;
  return <Steps steps={ONBOARDING_STEPS} current={current} />;
}
