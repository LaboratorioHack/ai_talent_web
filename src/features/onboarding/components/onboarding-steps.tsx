"use client";

import { usePathname, useRouter } from "next/navigation";
import { Steps } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";

export const ONBOARDING_STEPS = ["Cuenta", "Organización", "Primera vacante"];

/** Índice del paso según la URL: /onboarding/2 es 1; /onboarding/listo marca los tres como hechos. */
export function useOnboardingStep(): number {
  const pathname = usePathname();
  const last = pathname.split("/").pop();
  const step = Number(last);
  return last === "listo" ? 3 : Number.isFinite(step) && step >= 1 && step <= 3 ? step - 1 : 1;
}

/** Pasos del onboarding; los ya hechos llevan de vuelta a su pantalla (la cuenta no). */
export function OnboardingSteps() {
  const router = useRouter();
  const current = useOnboardingStep();
  return (
    <Steps
      steps={ONBOARDING_STEPS}
      current={current}
      onStepClick={(i) => {
        if (i >= 1 && i <= 2) router.push(routes.onboarding((i + 1) as 2 | 3));
      }}
    />
  );
}

/** Progreso fino a lo ancho de la barra superior. */
export function OnboardingProgress() {
  const current = useOnboardingStep();
  const ratio = Math.min(1, (current + 1) / ONBOARDING_STEPS.length);
  return (
    <div aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-border">
      <div className="h-full origin-left bg-amber transition-transform duration-700 ease-[var(--ease-out-soft)]" style={{ transform: `scaleX(${ratio})` }} />
    </div>
  );
}
