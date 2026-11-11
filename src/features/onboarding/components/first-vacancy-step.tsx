"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/shared/components/ui";
import { routes } from "@/shared/constants/routes";
import type { RoleProfileDraft } from "@/features/vacancies/schemas/role-profile";
import { RoleProfileEditor } from "@/features/vacancies/components";
import { createVacancy } from "@/features/vacancies/api/role-profiles";
import { useOnboarding } from "../state/onboarding-store";

/**
 * Pantalla 04 · Onboarding · Paso 4 Primera vacante.
 * Compone el editor de la feature `vacancies`; vive en `onboarding` porque la
 * navegación y los textos son los del flujo de alta.
 */
export function FirstVacancyStep({ initial }: { initial: RoleProfileDraft }) {
  const router = useRouter();
  const { toast } = useToast();
  const { update } = useOnboarding();

  async function finish(draft: RoleProfileDraft) {
    await createVacancy(draft);
    update({ vacancy: { title: draft.title, requirements: draft.requirements.length } });
    toast({ title: "Vacante creada", description: draft.title });
    router.push(routes.onboardingDone);
  }

  return <RoleProfileEditor initial={initial} eyebrow="Paso 4 de 4" onSave={finish} onEvaluate={finish} saveLabel="Guardar borrador" evaluateLabel="Crear vacante" />;
}
